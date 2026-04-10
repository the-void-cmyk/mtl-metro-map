import type { Metadata } from "next"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import ServiceStatus from "@/components/ServiceStatus"
import SchemaMarkup from "@/components/SchemaMarkup"

interface StatusPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Etat du service' : 'Service Status',
    description: locale === 'fr'
      ? 'Etat du service en temps reel du metro de Montreal, du REM et des trains de banlieue Exo. Retards, interruptions et travaux planifies.'
      : 'Real-time service status for Montreal Metro, REM, and Exo commuter trains. Delays, interruptions, and planned work.',
  }
}

export default async function StatusPage({ params }: StatusPageProps) {
  const { locale } = await params
  const isFr = locale === 'fr'

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: isFr ? "Etat du service - MTL Metro" : "Service Status - MTL Metro",
    description: isFr
      ? "Etat du service en temps reel du transport en commun de Montreal."
      : "Real-time Montreal transit service status.",
    url: `https://mtlmetromap.com/${locale}/status`,
  }

  return (
    <>
      <SchemaMarkup data={[schema]} />
      <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
        <Breadcrumbs
          items={[{ name: isFr ? 'Etat du service' : 'Service Status', url: `/${locale}/status` }]}
          locale={locale as Locale}
        />

        <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight mt-5 mb-2">
          {isFr ? 'Etat du service' : 'Service Status'}
        </h1>
        <p className="text-[var(--text-secondary)] text-[15px] mb-8">
          {isFr
            ? 'Statut en temps reel du metro, du REM et des trains de banlieue Exo. Mise a jour automatique.'
            : 'Real-time status for Metro, REM, and Exo commuter trains. Auto-refreshes every minute.'}
        </p>

        <div className="max-w-2xl">
          <ServiceStatus locale={locale as Locale} />
        </div>
      </div>
    </>
  )
}
