import type { Metadata } from "next"
import Link from "next/link"
import { getStationBySlug, getLinesForStation } from "@/lib/stations"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { Landmark } from "@/lib/types"
import landmarks from "../../../../data/landmarks.json"

const allLandmarks = landmarks as Landmark[]

interface DestinationsPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: DestinationsPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const altLocale = locale === "en" ? "fr" : "en"

  return {
    title: t.destinations,
    description: t.exploreDestinations,
    alternates: {
      canonical: `/${locale}/destinations`,
      languages: {
        [locale]: `/${locale}/destinations`,
        [altLocale]: `/${altLocale}/destinations`,
      },
    },
  }
}

const categoryOrder = [
  "sports",
  "tourism",
  "education",
  "parks",
  "culture",
  "shopping",
  "transport",
] as const

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)

  const categoryLabels: Record<string, string> = {
    sports: t.categorySports,
    tourism: t.categoryTourism,
    parks: t.categoryParks,
    education: t.categoryEducation,
    shopping: t.categoryShopping,
    culture: t.categoryCulture,
    transport: t.categoryTransport,
  }

  // Group landmarks by category
  const grouped = new Map<string, Landmark[]>()
  for (const cat of categoryOrder) {
    const items = allLandmarks.filter((l) => l.category === cat)
    if (items.length > 0) {
      grouped.set(cat, items)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ name: t.destinations, url: `/${locale}/destinations` }]}
        locale={locale as Locale}
      />

      <div className="mt-5 mb-8">
        <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
          {t.destinations}
        </h1>
        <p className="text-[var(--text-secondary)] text-[15px] mt-2 max-w-2xl">
          {t.exploreDestinations}
        </p>
      </div>

      <div className="space-y-10">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <section key={category}>
            <h2 className="font-heading text-lg font-semibold tracking-tight mb-4">
              {categoryLabels[category] ?? category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((landmark) => {
                const station = getStationBySlug(landmark.nearestStation)
                const lines = station ? getLinesForStation(station.id) : []
                const name = locale === "fr" ? landmark.nameFr : landmark.name
                const desc =
                  locale === "fr"
                    ? landmark.descriptionFr
                    : landmark.description

                return (
                  <Link
                    key={landmark.id}
                    href={`/${locale}/destination/${landmark.id}`}
                    className="info-card hover:border-[var(--accent)]/30 transition-colors group"
                  >
                    <div className="info-card-body">
                      <h3 className="font-heading font-semibold text-[15px] tracking-tight group-hover:text-[var(--accent)] transition-colors">
                        {name}
                      </h3>
                      <p className="text-[13px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                        {desc}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex gap-1">
                          {lines.map((line) => (
                            <span
                              key={line.id}
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: line.color }}
                            />
                          ))}
                        </div>
                        <span className="text-[12px] text-[var(--text-muted)]">
                          {station?.name ?? landmark.nearestStation}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
