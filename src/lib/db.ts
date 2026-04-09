import { createClient, type Client } from '@libsql/client'

let client: Client | null = null

function getClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (url) {
      // Production: Turso hosted database
      client = createClient({ url, authToken })
    } else {
      // Development: local SQLite file
      client = createClient({ url: 'file:db/metro.db' })
    }
  }
  return client
}

// Initialize tables on first use
let initialized = false

async function ensureInitialized(): Promise<void> {
  if (initialized) return
  const db = getClient()

  await db.executeMultiple(`
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

  initialized = true
}

// View tracking
export async function incrementView(fromSlug: string, toSlug: string): Promise<void> {
  await ensureInitialized()
  const db = getClient()
  const now = new Date().toISOString()

  await db.execute({
    sql: `INSERT INTO route_views (from_slug, to_slug, view_count, first_viewed_at, last_viewed_at)
          VALUES (?, ?, 1, ?, ?)
          ON CONFLICT(from_slug, to_slug) DO UPDATE SET
            view_count = view_count + 1,
            last_viewed_at = ?`,
    args: [fromSlug, toSlug, now, now, now],
  })
}

// Get view count for a route
export async function getViewCount(fromSlug: string, toSlug: string): Promise<number> {
  await ensureInitialized()
  const db = getClient()
  const result = await db.execute({
    sql: 'SELECT view_count FROM route_views WHERE from_slug = ? AND to_slug = ?',
    args: [fromSlug, toSlug],
  })
  return (result.rows[0]?.view_count as number) ?? 0
}

// Get popular routes from a station
export async function getPopularRoutes(stationSlug: string): Promise<Array<{ toSlug: string; toName: string; views: number }>> {
  await ensureInitialized()
  const db = getClient()
  const result = await db.execute({
    sql: 'SELECT routes FROM popular_routes WHERE station_slug = ?',
    args: [stationSlug],
  })

  if (!result.rows[0]) return []
  return JSON.parse(result.rows[0].routes as string)
}

// Get all sitemap entries
export async function getSitemapEntries(): Promise<Array<{ url: string; type: string; lastModified: string; priority: number }>> {
  await ensureInitialized()
  const db = getClient()
  const result = await db.execute(
    'SELECT url, type, last_modified as lastModified, priority FROM sitemap_entries ORDER BY priority DESC'
  )
  return result.rows as unknown as Array<{ url: string; type: string; lastModified: string; priority: number }>
}

// Promote routes to sitemap (used by daily cron)
export async function promoteToSitemap(threshold: number): Promise<number> {
  await ensureInitialized()
  const db = getClient()
  const now = new Date().toISOString()

  const qualifying = await db.execute({
    sql: 'SELECT from_slug, to_slug FROM route_views WHERE view_count >= ? AND in_sitemap = 0',
    args: [threshold],
  })

  if (qualifying.rows.length === 0) return 0

  const transaction = qualifying.rows.map((route) => [
    {
      sql: `INSERT OR IGNORE INTO sitemap_entries (url, type, added_at, last_modified, priority)
            VALUES (?, 'route', ?, ?, 0.6)`,
      args: [`/route/${route.from_slug}-to-${route.to_slug}`, now, now],
    },
    {
      sql: 'UPDATE route_views SET in_sitemap = 1, promoted_at = ? WHERE from_slug = ? AND to_slug = ?',
      args: [now, route.from_slug as string, route.to_slug as string],
    },
  ]).flat()

  await db.batch(transaction)
  return qualifying.rows.length
}

// Update popular routes for a station (used by weekly cron)
export async function updatePopularRoutes(stationSlug: string, limit: number = 10): Promise<void> {
  await ensureInitialized()
  const db = getClient()
  const now = new Date().toISOString()

  const popular = await db.execute({
    sql: 'SELECT to_slug as toSlug, view_count as views FROM route_views WHERE from_slug = ? ORDER BY view_count DESC LIMIT ?',
    args: [stationSlug, limit],
  })

  const routesJson = JSON.stringify(popular.rows)

  await db.execute({
    sql: `INSERT INTO popular_routes (station_slug, routes, computed_at)
          VALUES (?, ?, ?)
          ON CONFLICT(station_slug) DO UPDATE SET
            routes = ?,
            computed_at = ?`,
    args: [stationSlug, routesJson, now, routesJson, now],
  })
}
