import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'db', 'metro.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('busy_timeout = 5000')
    initializeDb(db)
  }
  return db
}

function initializeDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS route_views (
      from_slug TEXT NOT NULL,
      to_slug TEXT NOT NULL,
      view_count INTEGER DEFAULT 0,
      first_viewed_at TEXT NOT NULL,
      last_viewed_at TEXT NOT NULL,
      in_sitemap INTEGER DEFAULT 0,
      promoted_at TEXT,
      PRIMARY KEY (from_slug, to_slug)
    );

    CREATE TABLE IF NOT EXISTS popular_routes (
      station_slug TEXT PRIMARY KEY,
      routes TEXT NOT NULL,
      computed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sitemap_entries (
      url TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      added_at TEXT NOT NULL,
      last_modified TEXT NOT NULL,
      priority REAL DEFAULT 0.5
    );

    CREATE INDEX IF NOT EXISTS idx_route_views_count
      ON route_views(view_count DESC);

    CREATE INDEX IF NOT EXISTS idx_route_views_sitemap
      ON route_views(in_sitemap, view_count DESC);

    CREATE INDEX IF NOT EXISTS idx_route_views_from
      ON route_views(from_slug, view_count DESC);
  `)
}

// View tracking
export function incrementView(fromSlug: string, toSlug: string): void {
  const db = getDb()
  const now = new Date().toISOString()

  db.prepare(`
    INSERT INTO route_views (from_slug, to_slug, view_count, first_viewed_at, last_viewed_at)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(from_slug, to_slug) DO UPDATE SET
      view_count = view_count + 1,
      last_viewed_at = ?
  `).run(fromSlug, toSlug, now, now, now)
}

// Get view count for a route
export function getViewCount(fromSlug: string, toSlug: string): number {
  const db = getDb()
  const row = db.prepare(
    'SELECT view_count FROM route_views WHERE from_slug = ? AND to_slug = ?'
  ).get(fromSlug, toSlug) as { view_count: number } | undefined
  return row?.view_count ?? 0
}

// Get popular routes from a station
export function getPopularRoutes(stationSlug: string): Array<{ toSlug: string; toName: string; views: number }> {
  const db = getDb()
  const row = db.prepare(
    'SELECT routes FROM popular_routes WHERE station_slug = ?'
  ).get(stationSlug) as { routes: string } | undefined

  if (!row) return []
  return JSON.parse(row.routes)
}

// Get all sitemap entries
export function getSitemapEntries(): Array<{ url: string; type: string; lastModified: string; priority: number }> {
  const db = getDb()
  return db.prepare(
    'SELECT url, type, last_modified as lastModified, priority FROM sitemap_entries ORDER BY priority DESC'
  ).all() as Array<{ url: string; type: string; lastModified: string; priority: number }>
}

// Promote routes to sitemap (used by daily cron)
export function promoteToSitemap(threshold: number): number {
  const db = getDb()
  const now = new Date().toISOString()

  // Find routes that qualify
  const qualifying = db.prepare(`
    SELECT from_slug, to_slug FROM route_views
    WHERE view_count >= ? AND in_sitemap = 0
  `).all(threshold) as Array<{ from_slug: string; to_slug: string }>

  if (qualifying.length === 0) return 0

  const insertSitemap = db.prepare(`
    INSERT OR IGNORE INTO sitemap_entries (url, type, added_at, last_modified, priority)
    VALUES (?, 'route', ?, ?, 0.6)
  `)

  const markPromoted = db.prepare(`
    UPDATE route_views SET in_sitemap = 1, promoted_at = ?
    WHERE from_slug = ? AND to_slug = ?
  `)

  const transaction = db.transaction(() => {
    for (const route of qualifying) {
      const url = `/route/${route.from_slug}-to-${route.to_slug}`
      insertSitemap.run(url, now, now)
      markPromoted.run(now, route.from_slug, route.to_slug)
    }
  })

  transaction()
  return qualifying.length
}

// Update popular routes for a station (used by weekly cron)
export function updatePopularRoutes(stationSlug: string, limit: number = 10): void {
  const db = getDb()
  const now = new Date().toISOString()

  const popular = db.prepare(`
    SELECT to_slug as toSlug, view_count as views
    FROM route_views
    WHERE from_slug = ?
    ORDER BY view_count DESC
    LIMIT ?
  `).all(stationSlug, limit)

  db.prepare(`
    INSERT INTO popular_routes (station_slug, routes, computed_at)
    VALUES (?, ?, ?)
    ON CONFLICT(station_slug) DO UPDATE SET
      routes = ?,
      computed_at = ?
  `).run(stationSlug, JSON.stringify(popular), now, JSON.stringify(popular), now)
}
