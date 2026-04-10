import { TransitGraph } from './graph'
import { getStationById, getLineById, getConnections } from './stations'
import { calculateFare } from './fares'
import type { RouteResult, RouteComparison, RouteLabel, Segment, Transfer, Station } from './types'

let graph: TransitGraph | null = null

function getGraph(): TransitGraph {
  if (!graph) {
    graph = new TransitGraph(getConnections())
  }
  return graph
}

interface DijkstraResult {
  path: string[]
  totalTime: number
  edges: Array<{ to: string; weight: number; lineId: string; type: 'rail' | 'walk' }>
}

function buildRouteResult(
  from: Station,
  to: Station,
  result: DijkstraResult,
  label?: RouteLabel
): RouteResult | null {
  if (!result || result.path.length < 2) return null

  const segments: Segment[] = []
  const transfers: Transfer[] = []
  const pathStations: Station[] = result.path.map(id => getStationById(id)!).filter(Boolean)

  let currentLineId = result.edges[0]?.lineId
  let segmentStart = 0

  for (let i = 1; i < result.edges.length; i++) {
    const edge = result.edges[i]
    if (edge.lineId !== currentLineId) {
      const segStations = pathStations.slice(segmentStart, i + 1)
      const line = getLineById(currentLineId)
      if (line && segStations.length >= 2) {
        segments.push({
          line,
          stations: segStations,
          startStation: segStations[0],
          endStation: segStations[segStations.length - 1],
          stops: segStations.length - 1,
          time: segStations.length > 1
            ? result.edges.slice(segmentStart, i).reduce((sum, e) => sum + e.weight, 0)
            : 0,
        })
      }

      const transferStation = pathStations[i]
      if (transferStation) {
        transfers.push({
          stationId: transferStation.id,
          stationName: transferStation.name,
          fromLine: currentLineId,
          toLine: edge.lineId,
          walkTime: 3,
        })
      }

      currentLineId = edge.lineId
      segmentStart = i
    }
  }

  const finalStations = pathStations.slice(segmentStart)
  const finalLine = getLineById(currentLineId)
  if (finalLine && finalStations.length >= 2) {
    segments.push({
      line: finalLine,
      stations: finalStations,
      startStation: finalStations[0],
      endStation: finalStations[finalStations.length - 1],
      stops: finalStations.length - 1,
      time: result.edges.slice(segmentStart).reduce((sum, e) => sum + e.weight, 0),
    })
  }

  const zonesTraversed = [...new Set(pathStations.map(s => s.zone))]
  const fare = calculateFare(zonesTraversed)
  const distance = haversineDistance(from.lat, from.lng, to.lat, to.lng)

  return {
    from,
    to,
    totalTime: result.totalTime,
    stops: pathStations.length - 1,
    transfers,
    segments,
    fare,
    firstTrain: from.firstTrain,
    lastTrain: from.lastTrain,
    distance: Math.round(distance * 10) / 10,
    path: pathStations,
    label,
  }
}

function getRouteFingerprint(route: RouteResult): string {
  const lines = route.segments.map(s => s.line.id).join(',')
  const transferStations = route.transfers.map(t => t.stationId).sort().join(',')
  return `${lines}|${transferStations}`
}

export function findRoute(fromSlug: string, toSlug: string): RouteResult | null {
  const from = getStationById(fromSlug)
  const to = getStationById(toSlug)

  if (!from || !to) return null
  if (from.id === to.id) return null

  const g = getGraph()
  const result = g.findShortestPath(from.id, to.id)
  if (!result) return null

  return buildRouteResult(from, to, result)
}

export function findRoutes(fromSlug: string, toSlug: string): RouteComparison | null {
  const from = getStationById(fromSlug)
  const to = getStationById(toSlug)

  if (!from || !to) return null
  if (from.id === to.id) return null

  const g = getGraph()

  // 1. Fastest route (primary)
  const fastestResult = g.findShortestPath(from.id, to.id)
  if (!fastestResult) return null

  const primary = buildRouteResult(from, to, fastestResult, 'fastest')
  if (!primary) return null

  const primaryFingerprint = getRouteFingerprint(primary)
  const alternatives: RouteResult[] = []

  // 2. Fewest transfers route (high transfer penalty)
  if (primary.transfers.length > 0) {
    const fewestResult = g.findShortestPath(from.id, to.id, { transferPenalty: 30 })
    if (fewestResult) {
      const fewest = buildRouteResult(from, to, fewestResult, 'fewest-transfers')
      if (fewest) {
        const fp = getRouteFingerprint(fewest)
        if (fp !== primaryFingerprint && fewest.transfers.length < primary.transfers.length) {
          alternatives.push(fewest)
        }
      }
    }
  }

  // 3. Alternative path (penalize edges from primary route)
  const edgePenalties = new Set<string>()
  for (let i = 0; i < fastestResult.edges.length; i++) {
    const fromStation = fastestResult.path[i]
    const edge = fastestResult.edges[i]
    edgePenalties.add(`${fromStation}->${edge.to}:${edge.lineId}`)
  }

  const altResult = g.findShortestPath(from.id, to.id, { edgePenalties })
  if (altResult) {
    const alt = buildRouteResult(from, to, altResult, 'alternative')
    if (alt) {
      const fp = getRouteFingerprint(alt)
      const isDuplicate = fp === primaryFingerprint || alternatives.some(a => getRouteFingerprint(a) === fp)
      if (!isDuplicate) {
        alternatives.push(alt)
      }
    }
  }

  return { primary, alternatives }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
