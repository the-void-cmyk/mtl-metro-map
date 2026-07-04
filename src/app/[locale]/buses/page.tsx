import type { Metadata } from "next"
import Link from "next/link"
import { getAllBuses, groupBuses, busColor } from "@/lib/buses"
import { generateBreadcrumbSchema } from "@/lib/seo"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import SchemaMarkup from "@/components/SchemaMarkup"

const BASE = "https://mtlmetromap.com"

interface BusesPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: BusesPageProps): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale === "fr"
  const title = isFr
    ? "Lignes d'autobus STM à Montréal : horaires, arrêts et trajets"
    : "STM Bus Routes in Montreal: Schedules, Stops & Maps"
  const description = isFr
    ? "Les principales lignes d'autobus de la STM à Montréal : arrêts dans l'ordre, fréquence et correspondances métro pour chaque ligne."
    : "Montreal's main STM bus routes: stops in order, frequency, and metro connections for each line. Find your bus by number."
  const altLocale = isFr ? "en" : "fr"
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${locale}/buses`,
      languages: {
        [locale]: `/${locale}/buses`,
        [altLocale]: `/${altLocale}/buses`,
        "x-default": "/en/buses",
      },
    },
    openGraph: { title, description, locale: isFr ? "fr_CA" : "en_CA", type: "website" },
  }
}

export default async function BusesPage({ params }: BusesPageProps) {
  const { locale } = await params
  const isFr = locale === "fr"
  const groups = groupBuses(locale as Locale)
  const total = getAllBuses().length

  const L = {
    buses: isFr ? "Autobus" : "Buses",
    h1: isFr ? "Lignes d'autobus STM" : "STM Bus Routes",
    intro: isFr
      ? `Les ${total} lignes d'autobus les plus fréquentées de la STM à Montréal. Chaque page présente les arrêts dans l'ordre, la fréquence et les correspondances avec le métro, le REM et les trains exo.`
      : `The ${total} busiest STM bus routes in Montreal. Each page lists the stops in order, service frequency, and connections to the metro, REM, and exo trains.`,
    stops: (n: number) => (isFr ? `${n} arrêts` : `${n} stops`),
    source: isFr
      ? "Données : Société de transport de Montréal (STM), sous licence CC-BY-4.0."
      : "Data: Société de transport de Montréal (STM), licensed under CC-BY-4.0.",
  }

  const breadcrumbItems = [{ name: L.buses, url: `/${locale}/buses` }]

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <SchemaMarkup data={[generateBreadcrumbSchema(breadcrumbItems, BASE)]} />
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight mt-5 mb-2">{L.h1}</h1>
      <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed max-w-3xl mb-8">{L.intro}</p>

      <div className="space-y-8">
        {groups.map((g) => (
          <div key={g.key}>
            <h2 className="font-heading text-lg font-semibold tracking-tight mb-3">{g.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {g.routes.map((b) => (
                <Link
                  key={b.route}
                  href={`/${locale}/bus/${b.route}`}
                  className="info-card hover:bg-[var(--surface-inset)] transition-colors"
                >
                  <div className="info-card-body py-3 flex items-center gap-3">
                    <span
                      className="flex-shrink-0 rounded-lg text-white font-heading font-bold flex items-center justify-center px-2 h-8 min-w-8 text-[14px]"
                      style={{ backgroundColor: busColor(b) }}
                    >
                      {b.route}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium truncate">{b.name}</span>
                      <span className="block text-[12px] text-[var(--text-muted)]">{L.stops(b.stopCount)}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-8">{L.source}</p>
    </div>
  )
}
