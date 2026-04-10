import type { Metadata } from "next"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import CostCalculator from "@/components/CostCalculator"
import stations from "../../../../data/stations.json"
import type { Station } from "@/lib/types"

const allStations = stations as Station[]

interface CalculatorPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: CalculatorPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  return {
    title: t.costCalculator,
    description: t.costCalculatorDesc,
  }
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ name: t.costCalculator, url: `/${locale}/calculator` }]}
        locale={locale as Locale}
      />

      <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight mt-5 mb-2">
        {t.costCalculator}
      </h1>
      <p className="text-[var(--text-secondary)] text-[15px] mb-8 max-w-2xl">
        {t.costCalculatorIntro}
      </p>

      <div className="max-w-3xl">
        <CostCalculator stations={allStations} locale={locale as Locale} />
      </div>
    </div>
  )
}
