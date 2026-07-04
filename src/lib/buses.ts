import busesData from '../../data/buses.json'

export interface BusConnection {
  slug: string
  name: string
  lineIds: string[]
  network: string
}

export interface BusRoute {
  route: string
  name: string
  color: string
  category: string
  freqFr: string
  directions: string[]
  headsigns: string[]
  stopCount: number
  stops: string[]
  metroConnections: BusConnection[]
  trips: number
}

const buses = busesData as BusRoute[]

export function getAllBuses(): BusRoute[] {
  return buses
}

export function getBusByRoute(route: string): BusRoute | undefined {
  return buses.find((b) => b.route === route)
}

export function busColor(b: BusRoute): string {
  return b.color ? `#${b.color}` : '#009EE0'
}

// STM route_desc -> bilingual category label + a plain-language frequency line.
export function busCategory(b: BusRoute, locale: 'en' | 'fr'): { label: string; freq: string } {
  if (b.category === 'Fréquente') {
    return locale === 'fr'
      ? { label: 'Réseau 10 minutes max', freq: 'Fréquence de 2 à 12 minutes, de 6 h à 20 h, du lundi au vendredi (les deux directions).' }
      : { label: '10-minutes-max network', freq: 'Every 2 to 12 minutes, 6 a.m. to 8 p.m., Monday to Friday (both directions).' }
  }
  if (b.category === 'Fréquente pointe') {
    return locale === 'fr'
      ? { label: 'Fréquent aux heures de pointe', freq: 'Fréquence de 2 à 12 minutes, de 6 h 30 à 9 h 30 et de 15 h à 18 h, du lundi au vendredi.' }
      : { label: 'Frequent at peak hours', freq: 'Every 2 to 12 minutes, 6:30-9:30 a.m. and 3-6 p.m., Monday to Friday.' }
  }
  return locale === 'fr'
    ? { label: 'Service de jour', freq: 'Lignes de jour seulement.' }
    : { label: 'Daytime service', freq: 'Daytime service only.' }
}

// Group buses for the hub, in a stable display order.
export function groupBuses(locale: 'en' | 'fr'): Array<{ key: string; title: string; routes: BusRoute[] }> {
  const order = ['Fréquente', 'Fréquente pointe', 'Jour']
  const titles: Record<string, { en: string; fr: string }> = {
    'Fréquente': { en: '10-minutes-max network', fr: 'Réseau 10 minutes max' },
    'Fréquente pointe': { en: 'Frequent at peak hours', fr: 'Fréquent aux heures de pointe' },
    'Jour': { en: 'Daytime routes', fr: 'Lignes de jour' },
  }
  return order
    .map((cat) => ({
      key: cat,
      title: locale === 'fr' ? titles[cat].fr : titles[cat].en,
      routes: buses
        .filter((b) => b.category === cat)
        .sort((a, b) => Number(a.route) - Number(b.route)),
    }))
    .filter((g) => g.routes.length > 0)
}

// Data-driven intro paragraph (unique per route, bilingual).
export function busIntro(b: BusRoute, locale: 'en' | 'fr'): string {
  const from = b.stops[0] || ''
  const to = b.stops[b.stops.length - 1] || ''
  const cat = busCategory(b, locale)
  const conns = b.metroConnections
  const connNames = conns.map((c) => c.name)
  const list = (names: string[]) => {
    const shown = names.slice(0, 6)
    const extra = names.length - shown.length
    const joined = shown.join(locale === 'fr' ? ', ' : ', ')
    return extra > 0 ? `${joined}${locale === 'fr' ? ` et ${extra} autres` : ` and ${extra} more`}` : joined
  }

  if (locale === 'fr') {
    const conn = conns.length
      ? `Elle permet des correspondances avec le métro, le REM ou les trains exo à ${list(connNames)}.`
      : `Cette ligne ne croise pas directement une station de métro.`
    return `La ligne d'autobus ${b.route} ${b.name} de la STM relie ${from} à ${to}, en desservant ${b.stopCount} arrêts. ${cat.freq} ${conn}`
  }
  const conn = conns.length
    ? `It connects with the metro, REM, or exo trains at ${list(connNames)}.`
    : `This route does not directly meet a metro station.`
  return `The ${b.route} ${b.name} is an STM bus route in Montreal, running between ${from} and ${to} and serving ${b.stopCount} stops. ${cat.freq} ${conn}`
}
