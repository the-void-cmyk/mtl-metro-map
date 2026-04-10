// Core types for the Montreal Metro route finder

export interface Station {
  id: string
  name: string
  nameFr: string
  slug: string
  lineIds: string[]
  network: 'metro' | 'rem' | 'exo'
  zone: 'A' | 'B' | 'C' | 'D' | 'AB' | 'ABC' | 'ABCD'
  lat: number
  lng: number
  accessible: boolean
  firstTrain: string
  lastTrain: string
  exoLine?: string // for Exo commuter trains
}

export interface Line {
  id: string
  name: string
  nameFr: string
  color: string // hex color
  textColor: string // text color for contrast
  network: 'metro' | 'rem' | 'exo'
  stations: string[] // ordered station IDs
}

export interface Connection {
  from: string // station ID
  to: string // station ID
  lineId: string
  travelTime: number // minutes
  type: 'rail' | 'walk'
  distance?: number // meters, for walking connections
}

export interface Transfer {
  stationId: string
  stationName: string
  fromLine: string
  toLine: string
  walkTime: number // minutes
}

export interface Segment {
  line: Line
  stations: Station[]
  startStation: Station
  endStation: Station
  stops: number
  time: number // minutes
}

export interface FareInfo {
  zones: string[]
  price: number
  currency: string
  ticketType: string
  validityMinutes: number
}

export type RouteLabel = 'fastest' | 'fewest-transfers' | 'alternative'

export interface RouteResult {
  from: Station
  to: Station
  totalTime: number // minutes
  stops: number
  transfers: Transfer[]
  segments: Segment[]
  fare: FareInfo
  firstTrain: string
  lastTrain: string
  distance: number // approximate km
  path: Station[] // ordered list of all stations
  label?: RouteLabel
}

export interface RouteComparison {
  primary: RouteResult
  alternatives: RouteResult[]
}

export interface PopularRoute {
  toSlug: string
  toName: string
  views: number
  time: number // minutes
  stops: number
}

export interface SitemapEntry {
  url: string
  type: 'route' | 'station' | 'line' | 'static'
  addedAt: string
  lastModified: string
  priority: number
}

export type CTRVariant = 'A' | 'B' | 'C' | 'D'

export interface Landmark {
  id: string
  name: string
  nameFr: string
  nearestStation: string
  category: 'sports' | 'tourism' | 'parks' | 'education' | 'shopping' | 'culture' | 'transport'
  description: string
  descriptionFr: string
}
