import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getStationBySlug, getLinesForStation } from "@/lib/stations"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import SearchBar from "@/components/SearchBar"
import type { Station, Landmark } from "@/lib/types"
import stations from "../../../../../data/stations.json"
import landmarks from "../../../../../data/landmarks.json"

const allStations = stations as Station[]
const allLandmarks = landmarks as Landmark[]

interface DestinationPageProps {
  params: Promise<{ slug: string; locale: string }>
}

function getLandmarkById(id: string): Landmark | undefined {
  return allLandmarks.find((l) => l.id === id)
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    allLandmarks.map((l) => ({ locale, slug: l.id }))
  )
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const landmark = getLandmarkById(slug)
  if (!landmark) return { title: "Not Found" }

  const name = locale === "fr" ? landmark.nameFr : landmark.name
  const desc = locale === "fr" ? landmark.descriptionFr : landmark.description
  const t = getTranslations(locale as Locale)
  const title = t.howToGetTo(name)
  const altLocale = locale === "en" ? "fr" : "en"

  return {
    title,
    description: `${title}. ${desc}. ${t.nearestStation}: ${landmark.nearestStation}.`,
    alternates: {
      canonical: `/${locale}/destination/${slug}`,
      languages: {
        [locale]: `/${locale}/destination/${slug}`,
        [altLocale]: `/${altLocale}/destination/${slug}`,
      },
    },
  }
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { slug, locale } = await params
  const landmark = getLandmarkById(slug)
  if (!landmark) notFound()

  const station = getStationBySlug(landmark.nearestStation)
  if (!station) notFound()

  const lines = getLinesForStation(station.id)
  const t = getTranslations(locale as Locale)
  const name = locale === "fr" ? landmark.nameFr : landmark.name
  const desc = locale === "fr" ? landmark.descriptionFr : landmark.description
  const networkLabel =
    station.network === "metro"
      ? t.stmLabel
      : station.network === "rem"
        ? t.remLabel
        : t.exoLabel

  const categoryLabels: Record<string, string> = {
    sports: t.categorySports,
    tourism: t.categoryTourism,
    parks: t.categoryParks,
    education: t.categoryEducation,
    shopping: t.categoryShopping,
    culture: t.categoryCulture,
    transport: t.categoryTransport,
  }

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: landmark.name,
    description: landmark.description,
    publicAccess: true,
    isAccessibleForFree: true,
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <Breadcrumbs
        items={[
          { name: t.destinations, url: `/${locale}/destinations` },
          { name, url: `/${locale}/destination/${slug}` },
        ]}
        locale={locale as Locale}
      />

      <div className="mt-5 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border)]">
            {categoryLabels[landmark.category] ?? landmark.category}
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
          {t.howToGetTo(name)}
        </h1>
        <p className="text-[var(--text-secondary)] text-[15px] mt-2 max-w-2xl">
          {desc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Get directions search */}
          <div className="info-card">
            <div className="info-card-header">{t.getDirections}</div>
            <div className="info-card-body">
              <p className="text-[13px] text-[var(--text-secondary)] mb-3">
                {t.planYourVisit}
              </p>
              <SearchBar
                stations={allStations}
                compact
                locale={locale as Locale}
                defaultTo={station}
              />
            </div>
          </div>

          {/* Station line details */}
          {lines.map((line) => (
            <div key={line.id} className="info-card">
              <div className="info-card-header flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                {locale === "fr" ? line.nameFr : line.name}
              </div>
              <div className="info-card-body">
                <div className="flex flex-wrap gap-1.5">
                  {line.stations.map((stId) => {
                    const st = allStations.find((s) => s.id === stId)
                    if (!st) return null
                    return st.id === station.id ? (
                      <span
                        key={stId}
                        className="text-[12px] px-2.5 py-1 rounded-md font-semibold text-white"
                        style={{ backgroundColor: line.color }}
                      >
                        {st.name}
                      </span>
                    ) : (
                      <Link
                        key={stId}
                        href={`/${locale}/station/${st.slug}`}
                        className="text-[12px] px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--surface-inset)] transition-colors"
                      >
                        {st.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          {/* Station info card */}
          <div className="info-card">
            <div className="info-card-header">{t.nearestStation}</div>
            <div className="info-card-body">
              <dl className="grid grid-cols-1 gap-y-4 text-[14px]">
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">
                    {t.station}
                  </dt>
                  <dd className="font-medium mt-0.5">
                    <Link
                      href={`/${locale}/station/${station.slug}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {station.name}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">
                    {t.network}
                  </dt>
                  <dd className="font-medium mt-0.5">{networkLabel}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">
                    {t.servedByLines}
                  </dt>
                  <dd className="flex gap-1.5 mt-0.5">
                    {lines.map((line) => (
                      <Link
                        key={line.id}
                        href={`/${locale}/line/${line.id}`}
                        className="line-badge"
                        style={{
                          backgroundColor: line.color,
                          color: line.textColor,
                        }}
                      >
                        {locale === "fr"
                          ? line.nameFr.replace("Ligne ", "")
                          : line.name.replace(" Line", "")}
                      </Link>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">
                    {t.fareZone}
                  </dt>
                  <dd className="font-medium mt-0.5">Zone {station.zone}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">
                    {t.accessible}
                  </dt>
                  <dd className="font-medium mt-0.5 flex items-center gap-1.5">
                    {station.accessible ? (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-[#2E7D32] flex-shrink-0"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z"
                            fill="currentColor"
                          />
                        </svg>
                        {t.wheelchairAccessible}
                      </>
                    ) : (
                      <>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="text-[#E65100] flex-shrink-0"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                            fill="currentColor"
                          />
                        </svg>
                        {t.limitedAccessibility}
                      </>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Walking distance */}
          <div className="info-card">
            <div className="info-card-body flex items-center gap-2 text-[14px] text-[var(--text-secondary)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0"
                aria-hidden="true"
              >
                <path
                  d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"
                  fill="currentColor"
                />
              </svg>
              {t.walkingDistance}
            </div>
          </div>

          {/* View station link */}
          <Link
            href={`/${locale}/station/${station.slug}`}
            className="block text-center px-4 py-2.5 text-[14px] font-medium text-[var(--accent)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-inset)] transition-colors"
          >
            {t.viewStation}
          </Link>
        </div>
      </div>
    </div>
  )
}
