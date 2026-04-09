import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getLineById, getAllLines } from "@/lib/stations"
import { generateLineMetadata } from "@/lib/seo"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { Station } from "@/lib/types"
import stations from "../../../../../data/stations.json"

const allStations = stations as Station[]

interface LinePageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    getAllLines().map((l) => ({ locale, slug: l.id }))
  )
}

export async function generateMetadata({ params }: LinePageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const line = getLineById(slug)
  if (!line) return { title: "Line Not Found" }

  const meta = generateLineMetadata(line, line.stations.length)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/line/${slug}`,
      languages: { [locale]: `/${locale}/line/${slug}`, [altLocale]: `/${altLocale}/line/${slug}` },
    },
  }
}

export default async function LinePage({ params }: LinePageProps) {
  const { slug, locale } = await params
  const line = getLineById(slug)
  if (!line) notFound()

  const t = getTranslations(locale as Locale)
  const lineStations = line.stations.map((id) => allStations.find((s) => s.id === id)).filter(Boolean) as Station[]
  const networkLabel = line.network === "metro" ? t.stmLabel : line.network === "rem" ? t.remLabel : t.exoLabel
  const lineName = locale === 'fr' ? line.nameFr : line.name

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: t.lines, url: `/${locale}` },
          { name: lineName, url: `/${locale}/line/${line.id}` },
        ]}
        locale={locale as Locale}
      />

      <div className="flex items-center gap-3.5 mt-5 mb-8">
        <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
        <div>
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">{lineName}</h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-0.5">
            {networkLabel} {t.lineWith(lineStations.length)}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="info-card">
          <div className="info-card-header">{t.allStations(lineStations.length)}</div>
          <div className="info-card-body py-4">
            <div className="space-y-0">
              {lineStations.map((station, i) => {
                const isTerminal = i === 0 || i === lineStations.length - 1
                return (
                  <div key={station.id} className="flex items-stretch">
                    <div className="flex flex-col items-center w-[18px] flex-shrink-0">
                      {i > 0 ? <div className="route-line flex-1" style={{ backgroundColor: line.color }} /> : <div className="flex-1" />}
                      <div className={`route-station-dot ${isTerminal ? "route-station-dot-terminal" : "route-station-dot-intermediate"}`} style={isTerminal ? {} : { backgroundColor: line.color }} />
                      {i < lineStations.length - 1 ? <div className="route-line flex-1" style={{ backgroundColor: line.color }} /> : <div className="flex-1" />}
                    </div>
                    <Link href={`/${locale}/station/${station.slug}`} className="flex-1 ml-4 py-2 flex items-center justify-between hover:bg-[var(--surface-inset)] -mx-2 px-2 rounded-md transition-colors">
                      <div>
                        <span className={`text-[14px] ${isTerminal ? "font-semibold font-heading" : ""}`}>{station.name}</span>
                        {station.lineIds.length > 1 && (
                          <div className="flex gap-1 mt-0.5">
                            {station.lineIds.filter((lid) => lid !== line.id).map((lid) => {
                              const otherLine = getAllLines().find((l) => l.id === lid)
                              return otherLine ? <span key={lid} className="w-2 h-2 rounded-full" style={{ backgroundColor: otherLine.color }} title={locale === 'fr' ? otherLine.nameFr : otherLine.name} /> : null
                            })}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Zone {station.zone}</span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="info-card">
            <div className="info-card-header">{t.lineDetails}</div>
            <div className="info-card-body">
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{t.network}</dt>
                  <dd className="font-medium">{networkLabel}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{t.stops}</dt>
                  <dd className="font-heading font-medium">{lineStations.length}</dd>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{t.fromStation}</dt>
                  <dd className="font-medium">{lineStations[0]?.name}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{t.toStation}</dt>
                  <dd className="font-medium">{lineStations[lineStations.length - 1]?.name}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-header">{t.allLines}</div>
            <div className="info-card-body p-2">
              <div className="space-y-0.5">
                {getAllLines().map((l) => (
                  <Link key={l.id} href={`/${locale}/line/${l.id}`} className={`flex items-center gap-2.5 text-[14px] px-3 py-2.5 rounded-lg transition-colors ${l.id === line.id ? "bg-[var(--surface-inset)] font-medium" : "hover:bg-[var(--surface-inset)]"}`}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                    {locale === 'fr' ? l.nameFr : l.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
