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
    navStatus: 'Status',
    navTrip: 'Trip',

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
    recommended: 'Recommended',
    fastest: 'Fastest',
    fewestTransfers: 'Fewest Transfers',
    alternativeRoute: 'Alternative',
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

    // Multi-stop trip planner
    planTrip: 'Plan a Trip',
    addStop: 'Add stop',
    removeStop: 'Remove',
    stop: 'Stop',
    totalTrip: 'Total Trip',
    leg: 'Leg',
    planMultiStop: 'Plan your multi-stop journey across Montreal transit.',

    // Trip planner
    departAt: 'Depart at',
    arriveBy: 'Arrive by',
    today: 'Today',
    tomorrow: 'Tomorrow',
    estimatedArrival: 'Est. arrival',
    estimatedDeparture: 'Est. departure',
    outsideServiceHours: 'Outside service hours',

    // Breadcrumbs
    home: 'Home',

    // Accessibility
    navAccessibility: 'Accessibility',
    accessibilityGuide: 'Accessibility Guide',
    accessibilityDescription: 'Accessibility information for Montreal Metro, REM, and Exo stations.',
    fullyAccessible: 'Fully Accessible',
    limitedAccessibility: 'Limited Accessibility',
    accessibleStations: (count: number, total: number) => `${count} of ${total} stations are fully accessible`,
    accessibilityTips: 'Accessibility Tips',
    generalAccessibilityInfo: 'General Information',
    accessibilityOverview: 'Overview',
    wheelchairAccessible: 'Wheelchair Accessible',

    // Cost Calculator
    costCalculator: 'Cost Calculator',
    costCalculatorDesc: 'Compare pay-per-ride vs monthly pass for your commute.',
    homeStation: 'Home station',
    workStation: 'Work station',
    tripsPerWeek: 'Days per week',
    payPerRide: 'Pay per ride',
    monthlyPass: 'Monthly pass',
    perMonth: '/month',
    savings: 'You save',
    breakEven: (trips: number) => `Monthly pass pays for itself after ${trips} trips`,
    cheaperOption: 'Cheaper option',
    calculate: 'Calculate',
    selectBothStations: 'Select both stations to see your cost comparison.',
    tripsPerMonth: 'trips/month',
    costCalculatorIntro: 'Enter your home and work stations to compare paying per ride versus buying a monthly pass. Find out which option saves you more money based on how often you commute.',

    // Footer
    // Share
    shareRoute: 'Share route',
    copied: 'Copied!',

    footerDescription: 'Montreal transit route finder covering Metro, REM, and Exo commuter train networks.',
    navigate: 'Navigate',
    networkMap: 'Network Map',
    faresZones: 'Fares & Zones',

    // Nearby Stations
    nearbyStations: 'Nearby Stations',
    findNearby: 'Find nearby stations',
    locating: 'Getting your location...',
    locationError: 'Unable to get your location',
    metersAway: (m: number) => `${m}m away`,
    kmAway: (km: string) => `${km}km away`,
    routeFromHere: 'Route from here',

    // Compare Lines
    compareLines: 'Compare Lines',
    compareLinesDesc: 'Side-by-side comparison of all Montreal transit lines.',
    endToEnd: 'End to end',
    transferStations: 'Transfer stations',
    networkStats: 'Network Statistics',
    longestLine: 'Longest line',
    mostConnected: 'Most connected',
    totalStations: 'Total stations',
    totalLines: 'Total lines',
    totalConnections: 'Total connections',
    byStations: 'by stations',
    byTravelTime: 'by travel time',
    accessibleCount: 'Accessible',

    // Destinations
    destinations: 'Destinations',
    howToGetTo: (name: string) => `How to Get to ${name} by Metro`,
    nearestStation: 'Nearest station',
    getDirections: 'Get directions',
    walkingDistance: 'Short walk from station',
    categorySports: 'Sports',
    categoryTourism: 'Tourism',
    categoryParks: 'Parks',
    categoryEducation: 'Education',
    categoryShopping: 'Shopping',
    categoryCulture: 'Culture',
    categoryTransport: 'Transport',
    planYourVisit: 'Plan your visit',
    servedByLines: 'Served by',
    viewStation: 'View station details',
    exploreDestinations: 'Popular Montreal destinations accessible by metro.',

    // Station guides
    neighborhoodGuide: 'Neighborhood Guide',
    thingsNearby: 'Things Nearby',
    localTip: 'Local Tip',
    education: 'Education',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    dining: 'Dining',
    parks: 'Parks',
    culture: 'Culture',
    sports: 'Sports',
    transport: 'Transport',

    // Transit Guides
    transitGuides: 'Transit Guides',
    readMore: 'Read more',
    tableOfContents: 'In this guide',
    guidesDescription: 'Helpful guides for navigating Montreal transit.',
  },

  fr: {
    siteName: 'MTL Metro',
    siteDescription: 'Trouvez le trajet le plus rapide sur le reseau de metro, REM et trains de banlieue Exo de Montreal.',
    siteTagline: 'Planificateur de trajet Metro Montreal',

    navMap: 'Carte',
    navFares: 'Tarifs',
    navStatus: 'Statut',
    navTrip: 'Trajet',

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
    recommended: 'Recommande',
    fastest: 'Le plus rapide',
    fewestTransfers: 'Moins de correspondances',
    alternativeRoute: 'Alternatif',
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

    planTrip: 'Planifier un trajet',
    addStop: 'Ajouter un arret',
    removeStop: 'Retirer',
    stop: 'Arret',
    totalTrip: 'Trajet total',
    leg: 'Troncon',
    planMultiStop: 'Planifiez votre trajet multi-arrets sur le reseau de Montreal.',

    departAt: 'Depart a',
    arriveBy: 'Arriver avant',
    today: "Aujourd'hui",
    tomorrow: 'Demain',
    estimatedArrival: 'Arrivee est.',
    estimatedDeparture: 'Depart est.',
    outsideServiceHours: 'Hors des heures de service',

    home: 'Accueil',

    // Accessibility
    navAccessibility: 'Accessibilite',
    accessibilityGuide: "Guide d'accessibilite",
    accessibilityDescription: "Informations sur l'accessibilite des stations du Metro, REM et Exo de Montreal.",
    fullyAccessible: 'Entierement accessible',
    limitedAccessibility: 'Accessibilite limitee',
    accessibleStations: (count: number, total: number) => `${count} de ${total} stations sont entierement accessibles`,
    accessibilityTips: "Conseils d'accessibilite",
    generalAccessibilityInfo: 'Informations generales',
    accessibilityOverview: 'Apercu',
    wheelchairAccessible: 'Accessible en fauteuil roulant',

    // Cost Calculator
    costCalculator: 'Calculateur de couts',
    costCalculatorDesc: 'Comparez le cout par trajet vs la passe mensuelle.',
    homeStation: 'Station de depart',
    workStation: 'Station de travail',
    tripsPerWeek: 'Jours par semaine',
    payPerRide: 'Paiement par trajet',
    monthlyPass: 'Passe mensuelle',
    perMonth: '/mois',
    savings: 'Vous economisez',
    breakEven: (trips: number) => `La passe mensuelle est rentable apres ${trips} trajets`,
    cheaperOption: 'Option la moins chere',
    calculate: 'Calculer',
    selectBothStations: 'Selectionnez les deux stations pour voir la comparaison des couts.',
    tripsPerMonth: 'trajets/mois',
    costCalculatorIntro: 'Entrez vos stations de depart et de travail pour comparer le paiement par trajet et la passe mensuelle. Decouvrez quelle option vous fait economiser le plus selon la frequence de vos deplacements.',

    // Share
    shareRoute: 'Partager le trajet',
    copied: 'Copie!',

    footerDescription: 'Planificateur de trajet couvrant le metro, le REM et les trains de banlieue Exo de Montreal.',
    navigate: 'Navigation',
    networkMap: 'Carte du reseau',
    faresZones: 'Tarifs et zones',

    // Nearby Stations
    nearbyStations: 'Stations a proximite',
    findNearby: 'Trouver les stations proches',
    locating: 'Localisation en cours...',
    locationError: 'Impossible de vous localiser',
    metersAway: (m: number) => `a ${m}m`,
    kmAway: (km: string) => `a ${km}km`,
    routeFromHere: 'Trajet depuis ici',

    // Compare Lines
    compareLines: 'Comparer les lignes',
    compareLinesDesc: 'Comparaison de toutes les lignes de transport de Montreal.',
    endToEnd: 'Bout en bout',
    transferStations: 'Stations de correspondance',
    networkStats: 'Statistiques du reseau',
    longestLine: 'Ligne la plus longue',
    mostConnected: 'La plus connectee',
    totalStations: 'Total des stations',
    totalLines: 'Total des lignes',
    totalConnections: 'Total des correspondances',
    byStations: 'par stations',
    byTravelTime: 'par temps de trajet',
    accessibleCount: 'Accessible',

    // Destinations
    destinations: 'Destinations',
    howToGetTo: (name: string) => `Comment se rendre a ${name} en metro`,
    nearestStation: 'Station la plus proche',
    getDirections: 'Obtenir l\'itineraire',
    walkingDistance: 'Courte marche depuis la station',
    categorySports: 'Sports',
    categoryTourism: 'Tourisme',
    categoryParks: 'Parcs',
    categoryEducation: 'Education',
    categoryShopping: 'Magasinage',
    categoryCulture: 'Culture',
    categoryTransport: 'Transport',
    planYourVisit: 'Planifiez votre visite',
    servedByLines: 'Desservie par',
    viewStation: 'Voir les details de la station',
    exploreDestinations: 'Destinations populaires de Montreal accessibles en metro.',

    // Station guides
    neighborhoodGuide: 'Guide du quartier',
    thingsNearby: 'A proximite',
    localTip: 'Conseil local',
    education: 'Education',
    shopping: 'Shopping',
    entertainment: 'Divertissement',
    dining: 'Restauration',
    parks: 'Parcs',
    culture: 'Culture',
    sports: 'Sports',
    transport: 'Transport',

    // Transit Guides
    transitGuides: 'Guides de transport',
    readMore: 'Lire la suite',
    tableOfContents: 'Dans ce guide',
    guidesDescription: 'Guides utiles pour naviguer dans le transport de Montreal.',
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
