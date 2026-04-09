import stationsData from '../../data/stations.json'
import connectionsData from '../../data/connections.json'
import linesData from '../../data/lines.json'
import type { Station, Connection, Line } from './types'

const stations = stationsData as Station[]
const connections = connectionsData as Connection[]
const lines = linesData as Line[]

// Index maps for fast lookup
const stationById = new Map<string, Station>()
const stationsByLine = new Map<string, Station[]>()
const lineById = new Map<string, Line>()

// Build indexes
for (const station of stations) {
  stationById.set(station.id, station)
  for (const lineId of station.lineIds) {
    if (!stationsByLine.has(lineId)) {
      stationsByLine.set(lineId, [])
    }
    stationsByLine.get(lineId)!.push(station)
  }
}

for (const line of lines) {
  lineById.set(line.id, line)
}

// Public API

export function getStationById(id: string): Station | undefined {
  return stationById.get(id)
}

export function getStationBySlug(slug: string): Station | undefined {
  return stationById.get(slug) // id === slug in our data
}

export function getAllStations(): Station[] {
  return stations
}

export function getStationsForLine(lineId: string): Station[] {
  return stationsByLine.get(lineId) ?? []
}

export function getLineById(lineId: string): Line | undefined {
  return lineById.get(lineId)
}

export function getAllLines(): Line[] {
  return lines
}

export function getConnections(): Connection[] {
  return connections
}

export function getLinesForStation(stationId: string): Line[] {
  const station = stationById.get(stationId)
  if (!station) return []
  return station.lineIds.map(id => lineById.get(id)).filter(Boolean) as Line[]
}

/**
 * Fuzzy search stations by name.
 * Handles accented characters (e.g., "Cote" matches "Cote-Vertu").
 * Returns up to `limit` results sorted by relevance.
 */
export function searchStations(query: string, limit: number = 10): Station[] {
  if (!query || query.length < 1) return []

  const normalizedQuery = normalizeText(query.toLowerCase())

  const scored = stations.map(station => {
    const name = normalizeText(station.name.toLowerCase())
    const nameFr = normalizeText(station.nameFr.toLowerCase())

    let score = 0

    // Exact start match (highest priority)
    if (name.startsWith(normalizedQuery) || nameFr.startsWith(normalizedQuery)) {
      score = 100
    }
    // Word start match
    else if (
      name.split(/[-\s]/).some(word => word.startsWith(normalizedQuery)) ||
      nameFr.split(/[-\s]/).some(word => word.startsWith(normalizedQuery))
    ) {
      score = 75
    }
    // Contains match
    else if (name.includes(normalizedQuery) || nameFr.includes(normalizedQuery)) {
      score = 50
    }

    return { station, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.station)
}

/**
 * Remove accents/diacritics for fuzzy matching.
 * "Cote-Sainte-Catherine" -> "cote-sainte-catherine"
 */
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function getStationCount(): number {
  return stations.length
}

export function getLineCount(): number {
  return lines.length
}
