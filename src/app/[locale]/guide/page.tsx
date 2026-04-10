import type { Metadata } from "next"
import Link from "next/link"
import { locales, getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import guides from "../../../../data/guides.json"

interface GuideIndexProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: GuideIndexProps): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title: t.transitGuides,
    description: t.guidesDescription,
    alternates: {
      canonical: `/${locale}/guide`,
      languages: {
        [locale]: `/${locale}/guide`,
        [altLocale]: `/${altLocale}/guide`,
      },
    },
  }
}

export default async function GuideIndexPage({ params }: GuideIndexProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const isFr = locale === 'fr'

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: t.transitGuides, url: `/${locale}/guide` },
        ]}
        locale={locale as Locale}
      />

      <div className="mt-6 mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">{t.transitGuides}</h1>
        <p className="text-[var(--text-muted)] text-[15px] mt-2 max-w-lg">{t.guidesDescription}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/${locale}/guide/${guide.slug}`}
            className="info-card group transition-shadow hover:shadow-md"
          >
            <div className="p-6">
              <h2 className="font-heading text-lg font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors">
                {isFr ? guide.titleFr : guide.title}
              </h2>
              <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed mt-2">
                {isFr ? guide.excerptFr : guide.excerpt}
              </p>
              <span className="inline-block mt-4 text-[13px] font-medium text-[var(--accent)]">
                {t.readMore} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
