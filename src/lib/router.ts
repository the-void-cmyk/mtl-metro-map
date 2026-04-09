import { TransitGraph } from './graph'
import { getStationById, getLineById, getConnections } from './stations'
import { calculateFare } from './fares'
import type { RouteResult, Segment, Transfer, Station } from './types'

let graph: TransitGraph | null = null

function getGraph(): TransitGraph {
  if (!graph) {
    graph = new TransitGraph(getConnections())
  }
  return graph
}

export function findRoute(fromSlug: string, toSlug: string): RouteResult | null {
  const from = getStationById(fromSlug)
  const to = getStationById(toSlug)

  if (!from || !to) return null
  if (from.id === to.id) return null

  const g = getGraph()
  const result = g.findShortestPath(from.id, to.id)

  if (!result || result.path.length < 2) return null

  // Build segments and transfers from the edges
  const segments: Segment[] = []
  const transfers: Transfer[] = []
  const pathStations: Station[] = result.path.map(id => getStationById(id)!).filter(Boolean)

  let currentLineId = result.edges[0]?.lineId
  let segmentStart = 0

  for (let i = 1; i < result.edges.length; i++) {
    const edge = result.edges[i]
    if (edge.lineId !== currentLineId) {
      // Line change: close current segment, record transfer
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

      // Record transfer
      const transferStation = pathStations[i]
      if (transferStation) {
        transfers.push({
          stationId: transferStation.id,
          stationName: transferStation.name,
          fromLine: currentLineId,
          toLine: edge.lineId,
          walkTime: 3, // standard transfer time
        })
      }

      currentLineId = edge.lineId
      segmentStart = i
    }
  }

  // Close final segment
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

  // Calculate fare based on zones traversed
  const zonesTraversed = [...new Set(pathStations.map(s => s.zone))]
  const fare = calculateFare(zonesTraversed)

  // Estimate distance (haversine between start and end, rough)
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
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth radius in km
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
