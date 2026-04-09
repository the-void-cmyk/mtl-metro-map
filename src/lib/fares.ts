import type { FareInfo } from './types'

// ARTM fare zones as of 2025
// Zone A: Island of Montreal
// Zone B: Laval, Longueuil agglomeration
// Zone C: Northern/Southern crown
// Zone D: Outer regions

interface FareRule {
  zones: string
  price: number
  ticketType: string
}

const FARE_RULES: FareRule[] = [
  { zones: 'A', price: 3.75, ticketType: 'Zone A - All Modes' },
  { zones: 'AB', price: 5.25, ticketType: 'Zone AB - All Modes' },
  { zones: 'ABC', price: 7.00, ticketType: 'Zone ABC - All Modes' },
  { zones: 'ABCD', price: 9.25, ticketType: 'Zone ABCD - All Modes' },
  { zones: 'B', price: 3.75, ticketType: 'Zone B - All Modes' },
  { zones: 'BC', price: 5.25, ticketType: 'Zone BC - All Modes' },
  { zones: 'C', price: 3.75, ticketType: 'Zone C - All Modes' },
  { zones: 'CD', price: 5.25, ticketType: 'Zone CD - All Modes' },
  { zones: 'D', price: 3.75, ticketType: 'Zone D - All Modes' },
]

const ZONE_ORDER = ['A', 'B', 'C', 'D']

export function calculateFare(zonesTraversed: string[]): FareInfo {
  // Flatten zone strings (a station might be in zone 'AB')
  const allZones = new Set<string>()
  for (const z of zonesTraversed) {
    for (const char of z) {
      if (ZONE_ORDER.includes(char)) {
        allZones.add(char)
      }
    }
  }

  // Sort zones and create the zone key
  const sortedZones = [...allZones].sort(
    (a, b) => ZONE_ORDER.indexOf(a) - ZONE_ORDER.indexOf(b)
  )
  const zoneKey = sortedZones.join('')

  // Find matching fare rule
  const rule = FARE_RULES.find(r => r.zones === zoneKey)

  if (rule) {
    return {
      zones: sortedZones,
      price: rule.price,
      currency: 'CAD',
      ticketType: rule.ticketType,
      validityMinutes: 120,
    }
  }

  // Fallback: determine by zone span
  const minZone = Math.min(...sortedZones.map(z => ZONE_ORDER.indexOf(z)))
  const maxZone = Math.max(...sortedZones.map(z => ZONE_ORDER.indexOf(z)))
  const span = maxZone - minZone

  let price: number
  let ticketType: string
  if (span === 0) {
    price = 3.75
    ticketType = `Zone ${sortedZones[0]} - All Modes`
  } else if (span === 1) {
    price = 5.25
    ticketType = `Zone ${zoneKey} - All Modes`
  } else if (span === 2) {
    price = 7.00
    ticketType = `Zone ${zoneKey} - All Modes`
  } else {
    price = 9.25
    ticketType = 'Zone ABCD - All Modes'
  }

  return {
    zones: sortedZones,
    price,
    currency: 'CAD',
    ticketType,
    validityMinutes: 120,
  }
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}
