import type { RouteResult, Station, Line } from './types'
import { formatPrice } from './fares'
import { getCTRVariant } from './ctr-variants'

// Generate metadata for a route page
export function generateRouteMetadata(route: RouteResult) {
  const variant = getCTRVariant(route.from.slug, route.to.slug)
  const title = generateTitle(route, variant)
  const description = generateDescription(route, variant)

  return {
    title,
    description,
    canonical: `/route/${route.from.slug}-to-${route.to.slug}`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/route/${route.from.slug}-to-${route.to.slug}`,
      siteName: 'MTL Metro',
    },
  }
}

function generateTitle(route: RouteResult, variant: string): string {
  const from = route.from.name
  const to = route.to.name
  const time = route.totalTime
  const stops = route.stops
  const fare = formatPrice(route.fare.price)
  const transfers = route.transfers.length

  switch (variant) {
    case 'A':
      return `${from} to ${to} - ${time} min, ${stops} stops`
    case 'B':
      return `${from} to ${to} Route & Schedule`
    case 'C':
      return `How to Get from ${from} to ${to} | ${time} min`
    case 'D':
      return `${from} to ${to} | ${fare}, ${transfers} Transfer${transfers !== 1 ? 's' : ''}`
    default:
      return `${from} to ${to} - ${time} min`
  }
}

function generateDescription(route: RouteResult, variant: string): string {
  const from = route.from.name
  const to = route.to.name
  const time = route.totalTime
  const stops = route.stops
  const fare = formatPrice(route.fare.price)
  const transfers = route.transfers.length
  const lineNames = route.segments.map(s => s.line.name).join(', ')

  switch (variant) {
    case 'A':
      return `Get from ${from} to ${to} in ${time} minutes. ${stops} stops, ${transfers} transfer(s). Fare: ${fare}. First train ${route.firstTrain}, last train ${route.lastTrain}. Montreal Metro route guide.`
    case 'B':
      return `Plan your Montreal Metro trip from ${from} to ${to}. ${time}-minute ride via ${lineNames}. See schedule, fare (${fare}), and step-by-step directions.`
    case 'C':
    default:
      return `${from} to ${to} metro route: ${time} min, ${fare}. ${stops} stops, ${transfers} transfer(s). Includes first/last train times, fare info, and step-by-step directions.`
  }
}

// Generate station page metadata
export function generateStationMetadata(station: Station, lines: Line[]) {
  const lineNames = lines.map(l => l.name).join(', ')
  return {
    title: `${station.name} Station | ${lineNames}`,
    description: `${station.name} station info: ${lineNames}. Zone ${station.zone}. First train ${station.firstTrain}, last train ${station.lastTrain}. Find routes, schedules, and popular destinations.`,
    canonical: `/station/${station.slug}`,
  }
}

// Generate line page metadata
export function generateLineMetadata(line: Line, stationCount: number) {
  return {
    title: `${line.name} | ${stationCount} Stations`,
    description: `${line.name} - ${stationCount} stations. View all stops, schedules, route map, and connections. Montreal Metro line guide.`,
    canonical: `/line/${line.id}`,
  }
}

// Schema.org JSON-LD for route pages
export function generateRouteSchema(route: RouteResult) {
  const steps = route.segments.flatMap((segment, segIndex) => {
    const segmentSteps = []

    // Board instruction
    segmentSteps.push({
      '@type': 'HowToStep',
      name: segIndex === 0
        ? `Board ${segment.line.name} at ${segment.startStation.name}`
        : `Transfer to ${segment.line.name} at ${segment.startStation.name}`,
      text: segIndex === 0
        ? `Board the ${segment.line.name} at ${segment.startStation.name} station heading towards ${segment.endStation.name}.`
        : `Transfer to the ${segment.line.name} at ${segment.startStation.name}. Board heading towards ${segment.endStation.name}.`,
    })

    // Ride instruction
    segmentSteps.push({
      '@type': 'HowToStep',
      name: `Ride ${segment.stops} stop${segment.stops !== 1 ? 's' : ''} (${segment.time} min)`,
      text: `Ride the ${segment.line.name} for ${segment.stops} stop${segment.stops !== 1 ? 's' : ''}, approximately ${segment.time} minutes.`,
    })

    return segmentSteps
  })

  // Add arrival step
  steps.push({
    '@type': 'HowToStep',
    name: `Arrive at ${route.to.name}`,
    text: `Exit at ${route.to.name} station. You have arrived at your destination.`,
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to get from ${route.from.name} to ${route.to.name} by Metro`,
    description: `Take Montreal transit from ${route.from.name} to ${route.to.name}. ${route.totalTime} minutes, ${route.stops} stops, ${route.transfers.length} transfer(s). Fare: ${formatPrice(route.fare.price)}.`,
    totalTime: `PT${route.totalTime}M`,
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'CAD',
      value: route.fare.price,
    },
    step: steps,
  }
}

// FAQ schema for route pages
export function generateFAQSchema(route: RouteResult) {
  const faqs = [
    {
      question: `How long does it take from ${route.from.name} to ${route.to.name}?`,
      answer: `The trip from ${route.from.name} to ${route.to.name} takes approximately ${route.totalTime} minutes with ${route.stops} stops and ${route.transfers.length} transfer(s).`,
    },
    {
      question: `How much does the fare cost from ${route.from.name} to ${route.to.name}?`,
      answer: `The fare is ${formatPrice(route.fare.price)} (${route.fare.ticketType}). The ticket is valid for ${route.fare.validityMinutes} minutes.`,
    },
    {
      question: `How many transfers are needed from ${route.from.name} to ${route.to.name}?`,
      answer: route.transfers.length === 0
        ? `No transfers are needed. This is a direct route on the ${route.segments[0]?.line.name}.`
        : `${route.transfers.length} transfer(s) needed: ${route.transfers.map(t => `at ${t.stationName} (${t.fromLine} to ${t.toLine})`).join(', ')}.`,
    },
    {
      question: `What is the first and last train from ${route.from.name}?`,
      answer: `The first train departs at ${route.firstTrain} and the last train departs at ${route.lastTrain}.`,
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Breadcrumb schema
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

// Website schema (for SERP site name)
export function generateWebsiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MTL Metro',
    url: baseUrl,
    description: 'Montreal Metro route finder. Plan your trip across Metro, REM, and Exo commuter trains.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
