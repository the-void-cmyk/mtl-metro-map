import type { RouteResult } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import { formatPrice } from "@/lib/fares"

interface FAQProps {
  route: RouteResult
  locale?: Locale
}

export default function FAQ({ route, locale = 'en' }: FAQProps) {
  const t = getTranslations(locale)

  const faqs = [
    {
      q: t.faqTime(route.from.name, route.to.name),
      a: t.faqTimeAnswer(route.from.name, route.to.name, route.totalTime, route.stops, route.transfers.length),
    },
    {
      q: t.faqCost,
      a: t.faqCostAnswer(formatPrice(route.fare.price), route.fare.ticketType, route.fare.validityMinutes),
    },
    {
      q: t.faqTransfers,
      a: route.transfers.length === 0
        ? t.faqTransfersNone(route.segments[0]?.line.name)
        : t.faqTransfersAnswer(route.transfers.length, route.transfers.map((tr) => tr.stationName).join(", ")),
    },
    {
      q: t.faqTrains,
      a: t.faqTrainsAnswer(route.firstTrain, route.lastTrain),
    },
  ]

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold tracking-tight mb-3">{t.faq}</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <details key={i} className="faq-item group">
            <summary>
              {faq.q}
              <svg className="w-4 h-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
