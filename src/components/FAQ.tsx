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
      q: `How much does the fare cost?`,
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
      q: `What is the first and last train?`,
      a: `The first train departs at ${route.firstTrain} and the last train departs at ${route.lastTrain}.`,
    },
  ]

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold tracking-tight mb-3">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <details key={i} className="faq-item group">
            <summary>
              {faq.q}
              <svg
                className="w-4 h-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="faq-answer">{faq.a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}
