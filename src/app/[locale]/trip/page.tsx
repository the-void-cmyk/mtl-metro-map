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
    title: locale === 'fr'
      ? 'Itinéraire Métro Montréal : Planifier un Trajet'
      : 'Montreal Metro Trip Planner: Routes & Times',
    description: locale === 'fr'
      ? 'Planifiez un itinéraire de métro multi-arrêts à Montréal. Ajoutez vos arrêts sur le réseau STM, REM et Exo et obtenez les trajets, horaires, correspondances et tarifs.'
      : 'Plan a multi-stop Montreal metro trip. Add stops across the STM Metro, REM, and Exo network and get routes, times, transfers, and fares.',
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
