export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

const translations = {
  en: {
    // Site
    siteName: 'MTL Metro',
    siteDescription: 'Find the fastest route across Montreal\'s Metro, REM, and Exo commuter train network.',
    siteTagline: 'Montreal Metro Route Finder',

    // Nav
    navMap: 'Map',
    navFares: 'Fares',

    // Home
    heroTitle1: 'Montreal Metro',
    heroTitle2: 'Route Finder',
    heroSubtitle: 'Plan your trip across the STM Metro, REM light rail, and Exo commuter train network.',
    heroBadge: (count: number) => `${count} stations across 3 networks`,
    networkTitle: 'The Network',
    networkSubtitle: 'Three interconnected transit systems, one fare.',
    stmLabel: 'STM Metro',
    remLabel: 'REM',
    exoLabel: 'Exo Commuter',
    stationsAcrossLines: (count: number, lines: number) => `${count} stations, ${lines} lines`,
    stationsAutomated: (count: number) => `${count} stations, automated light rail`,
    stationsTrainLines: (count: number, lines: number) => `${count} stations, ${lines} train lines`,
    fareZonesTitle: 'Fare Zones',
    fareZonesSubtitle: 'Unified pricing across all modes. Valid 120 minutes.',
    farePayment: 'OPUS Card or Contactless',
    planTripTitle: 'Plan Your Montreal Transit Trip',
    planTripText: 'MTL Metro calculates the fastest route between any two stations on Montreal\'s transit network. Whether you\'re traveling on the STM Metro, the REM automated light rail, or Exo commuter trains, get the optimal path with transfers, travel time, stops, and fare info.',
    montrealIsland: 'Montreal Island',
    montrealLaval: 'Montreal + Laval',
    innerSuburbs: '+ Inner Suburbs',
    fullNetwork: 'Full Network',

    // Search
    from: 'From',
    to: 'To',
    departureStation: 'Departure station...',
    arrivalStation: 'Arrival station...',
    findRoute: 'Find Route',
    swapStations: 'Swap stations',

    // Route page
    routeTitle: (from: string, to: string) => `${from} \u2192 ${to}`,
    routeDescription: (time: number, stops: number, transfers: number, fare: string) =>
      `Montreal transit route. ${time} minutes, ${stops} stops${transfers > 0 ? `, ${transfers} transfer(s)` : ', direct'}. Fare: ${fare}.`,
    minutes: 'Minutes',
    stops: 'Stops',
    transfers: 'Transfers',
    transfer: 'Transfer',
    fare: 'Fare',
    stepByStepRoute: 'Step-by-Step Route',
    routeDetails: 'Route Details',
    distance: 'Distance',
    lines: 'Lines',
    fareZone: 'Fare Zone',
    ticketValid: 'Ticket Valid',
    firstTrain: 'First Train',
    lastTrain: 'Last Train',
    accessible: 'Accessible',
    yes: 'Yes',
    no: 'No',
    partial: 'Partial',
    viewReverseRoute: 'View reverse route',
    findAnotherRoute: 'Find Another Route',
    departure: 'Departure',
    arrival: 'Arrival',
    transferAt: (station: string) => `Transfer at ${station}`,
    walkMin: '~3 min walk',
    routeTo: (to: string) => `Route to ${to}`,
    direct: 'direct',

    // Station page
    station: 'Station',
    stationInfo: 'Station Information',
    network: 'Network',
    findRouteFromHere: 'Find Route from Here',
    location: 'Location',
    stationServedBy: (network: string, lines: string, zone: string) =>
      `${network} station served by ${lines}. Zone ${zone}.`,

    // Line page
    lineWith: (count: number) => `line with ${count} stations`,
    allStations: (count: number) => `All ${count} Stations`,
    lineDetails: 'Line Details',
    allLines: 'All Lines',
    fromStation: 'From',
    toStation: 'To',

    // FAQ
    faq: 'FAQ',
    faqTime: (from: string, to: string) => `How long does it take from ${from} to ${to}?`,
    faqTimeAnswer: (from: string, to: string, time: number, stops: number, transfers: number) =>
      `The trip from ${from} to ${to} takes approximately ${time} minutes with ${stops} stops${transfers > 0 ? ` and ${transfers} transfer(s)` : ' (direct, no transfers)'}.`,
    faqCost: 'How much does the fare cost?',
    faqCostAnswer: (price: string, type: string, validity: number) =>
      `The fare is ${price} (${type}). The ticket is valid for ${validity} minutes across all transit modes.`,
    faqTransfers: 'How many transfers are needed?',
    faqTransfersNone: (line: string) => `No transfers needed. This is a direct route on the ${line}.`,
    faqTransfersAnswer: (count: number, stations: string) => `${count} transfer(s): ${stations}.`,
    faqTrains: 'What is the first and last train?',
    faqTrainsAnswer: (first: string, last: string) =>
      `The first train departs at ${first} and the last train departs at ${last}.`,

    // Breadcrumbs
    home: 'Home',

    // Footer
    footerDescription: 'Montreal transit route finder covering Metro, REM, and Exo commuter train networks.',
    navigate: 'Navigate',
    networkMap: 'Network Map',
    faresZones: 'Fares & Zones',
  },

  fr: {
    siteName: 'MTL Metro',
    siteDescription: 'Trouvez le trajet le plus rapide sur le reseau de metro, REM et trains de banlieue Exo de Montreal.',
    siteTagline: 'Planificateur de trajet Metro Montreal',

    navMap: 'Carte',
    navFares: 'Tarifs',

    heroTitle1: 'Metro Montreal',
    heroTitle2: 'Planificateur de trajet',
    heroSubtitle: 'Planifiez votre trajet sur le metro STM, le REM et les trains de banlieue Exo.',
    heroBadge: (count: number) => `${count} stations sur 3 reseaux`,
    networkTitle: 'Le reseau',
    networkSubtitle: 'Trois systemes de transport interconnectes, un seul tarif.',
    stmLabel: 'Metro STM',
    remLabel: 'REM',
    exoLabel: 'Trains Exo',
    stationsAcrossLines: (count: number, lines: number) => `${count} stations, ${lines} lignes`,
    stationsAutomated: (count: number) => `${count} stations, train leger automatise`,
    stationsTrainLines: (count: number, lines: number) => `${count} stations, ${lines} lignes de train`,
    fareZonesTitle: 'Zones tarifaires',
    fareZonesSubtitle: 'Tarification unifiee sur tous les modes. Valide 120 minutes.',
    farePayment: 'Carte OPUS ou paiement sans contact',
    planTripTitle: 'Planifiez votre trajet a Montreal',
    planTripText: 'MTL Metro calcule le trajet le plus rapide entre deux stations du reseau de transport de Montreal. Que vous voyagiez sur le metro STM, le REM ou les trains de banlieue Exo, obtenez le trajet optimal avec les correspondances, le temps de trajet, les arrets et les tarifs.',
    montrealIsland: 'Ile de Montreal',
    montrealLaval: 'Montreal + Laval',
    innerSuburbs: '+ Banlieue proche',
    fullNetwork: 'Reseau complet',

    from: 'De',
    to: 'A',
    departureStation: 'Station de depart...',
    arrivalStation: "Station d'arrivee...",
    findRoute: 'Trouver un trajet',
    swapStations: 'Inverser les stations',

    routeTitle: (from: string, to: string) => `${from} \u2192 ${to}`,
    routeDescription: (time: number, stops: number, transfers: number, fare: string) =>
      `Trajet en transport en commun a Montreal. ${time} minutes, ${stops} arrets${transfers > 0 ? `, ${transfers} correspondance(s)` : ', direct'}. Tarif : ${fare}.`,
    minutes: 'Minutes',
    stops: 'Arrets',
    transfers: 'Correspondances',
    transfer: 'Correspondance',
    fare: 'Tarif',
    stepByStepRoute: 'Trajet etape par etape',
    routeDetails: 'Details du trajet',
    distance: 'Distance',
    lines: 'Lignes',
    fareZone: 'Zone tarifaire',
    ticketValid: 'Billet valide',
    firstTrain: 'Premier train',
    lastTrain: 'Dernier train',
    accessible: 'Accessible',
    yes: 'Oui',
    no: 'Non',
    partial: 'Partiel',
    viewReverseRoute: 'Voir le trajet inverse',
    findAnotherRoute: 'Trouver un autre trajet',
    departure: 'Depart',
    arrival: 'Arrivee',
    transferAt: (station: string) => `Correspondance a ${station}`,
    walkMin: '~3 min a pied',
    routeTo: (to: string) => `Trajet vers ${to}`,
    direct: 'direct',

    station: 'Station',
    stationInfo: 'Informations sur la station',
    network: 'Reseau',
    findRouteFromHere: 'Trouver un trajet depuis ici',
    location: 'Emplacement',
    stationServedBy: (network: string, lines: string, zone: string) =>
      `Station ${network} desservie par ${lines}. Zone ${zone}.`,

    lineWith: (count: number) => `ligne avec ${count} stations`,
    allStations: (count: number) => `Les ${count} stations`,
    lineDetails: 'Details de la ligne',
    allLines: 'Toutes les lignes',
    fromStation: 'De',
    toStation: 'A',

    faq: 'FAQ',
    faqTime: (from: string, to: string) => `Combien de temps faut-il de ${from} a ${to} ?`,
    faqTimeAnswer: (from: string, to: string, time: number, stops: number, transfers: number) =>
      `Le trajet de ${from} a ${to} prend environ ${time} minutes avec ${stops} arrets${transfers > 0 ? ` et ${transfers} correspondance(s)` : ' (direct, sans correspondance)'}.`,
    faqCost: 'Combien coute le tarif ?',
    faqCostAnswer: (price: string, type: string, validity: number) =>
      `Le tarif est de ${price} (${type}). Le billet est valide ${validity} minutes sur tous les modes de transport.`,
    faqTransfers: 'Combien de correspondances sont necessaires ?',
    faqTransfersNone: (line: string) => `Aucune correspondance necessaire. C'est un trajet direct sur la ${line}.`,
    faqTransfersAnswer: (count: number, stations: string) => `${count} correspondance(s) : ${stations}.`,
    faqTrains: 'Quel est le premier et le dernier train ?',
    faqTrainsAnswer: (first: string, last: string) =>
      `Le premier train part a ${first} et le dernier train part a ${last}.`,

    home: 'Accueil',

    footerDescription: 'Planificateur de trajet couvrant le metro, le REM et les trains de banlieue Exo de Montreal.',
    navigate: 'Navigation',
    networkMap: 'Carte du reseau',
    faresZones: 'Tarifs et zones',
  },
} as const

export type Translations = (typeof translations)[Locale]

export function getTranslations(locale: Locale) {
  return translations[locale]
}

export function getStationName(station: { name: string; nameFr: string }, locale: Locale): string {
  // Most Montreal station names are the same in both languages
  // nameFr is used when there's a difference
  return locale === 'fr' ? station.nameFr : station.name
}
