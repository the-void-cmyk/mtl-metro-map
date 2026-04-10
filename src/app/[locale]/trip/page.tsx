import type { Metadata } from "next"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import MultiStopPlanner from "@/components/MultiStopPlanner"
import stations from "../../../../data/stations.json"
import type { Station } from "@/lib/types"

const allStations = stations as Station[]

interface TripPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Planifier un trajet' : 'Plan a Trip',
    description: locale === 'fr'
      ? 'Planifiez votre trajet multi-arrets sur le reseau de Montreal. Metro, REM et trains de banlieue Exo.'
      : 'Plan your multi-stop journey across Montreal transit. Metro, REM, and Exo commuter trains.',
  }
}

export default async function TripPage({ params }: TripPageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ name: t.planTrip, url: `/${locale}/trip` }]}
        locale={locale as Locale}
      />

      <div className="mt-6">
        <MultiStopPlanner stations={allStations} locale={locale as Locale} />
      </div>
    </div>
  )
}
