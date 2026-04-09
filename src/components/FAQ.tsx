import type { RouteResult } from "@/lib/types"
import { formatPrice } from "@/lib/fares"

interface FAQProps {
  route: RouteResult
}

export default function FAQ({ route }: FAQProps) {
  const faqs = [
    {
      q: `How long does it take from ${route.from.name} to ${route.to.name}?`,
      a: `The trip from ${route.from.name} to ${route.to.name} takes approximately ${route.totalTime} minutes with ${route.stops} stops${route.transfers.length > 0 ? ` and ${route.transfers.length} transfer(s)` : " (direct, no transfers)"}.`,
    },
    {
      q: `How much does the fare cost from ${route.from.name} to ${route.to.name}?`,
      a: `The fare is ${formatPrice(route.fare.price)} (${route.fare.ticketType}). The ticket is valid for ${route.fare.validityMinutes} minutes across all transit modes.`,
    },
    {
      q: `How many transfers are needed?`,
      a:
        route.transfers.length === 0
          ? `No transfers needed. This is a direct route on the ${route.segments[0]?.line.name}.`
          : `${route.transfers.length} transfer(s): ${route.transfers.map((t) => `at ${t.stationName}`).join(", ")}.`,
    },
    {
      q: `What is the first and last train from ${route.from.name}?`,
      a: `The first train departs at ${route.firstTrain} and the last train departs at ${route.lastTrain}.`,
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <details key={i} className="bg-white border border-gray-200 rounded-lg group">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-900 flex items-center justify-between">
              {faq.q}
              <svg
                className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-3 text-sm text-gray-600">{faq.a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}
