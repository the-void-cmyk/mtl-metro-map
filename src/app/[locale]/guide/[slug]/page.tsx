import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { locales, getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import guides from "../../../../../data/guides.json"

interface GuidePageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    guides.map((guide) => ({ locale, slug: guide.slug }))
  )
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const guide = guides.find((g) => g.slug === slug)
  if (!guide) return { title: "Guide Not Found" }

  const isFr = locale === 'fr'
  const title = isFr ? guide.titleFr : guide.title
  const description = isFr ? guide.excerptFr : guide.excerpt
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/guide/${slug}`,
      languages: {
        [locale]: `/${locale}/guide/${slug}`,
        [altLocale]: `/${altLocale}/guide/${slug}`,
      },
    },
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug, locale } = await params
  const guide = guides.find((g) => g.slug === slug)
  if (!guide) notFound()

  const t = getTranslations(locale as Locale)
  const isFr = locale === 'fr'

  const title = isFr ? guide.titleFr : guide.title
  const excerpt = isFr ? guide.excerptFr : guide.excerpt

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    publisher: {
      "@type": "Organization",
      name: "MTL Metro",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mtlmetro.com/${locale}/guide/${slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      <div className="max-w-3xl mx-auto px-5 py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { name: t.transitGuides, url: `/${locale}/guide` },
            { name: title, url: `/${locale}/guide/${slug}` },
          ]}
          locale={locale as Locale}
        />

        <div className="mt-6 mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-[var(--text-muted)] text-[15px] mt-2 max-w-lg">{excerpt}</p>
        </div>

        {/* Table of Contents */}
        <nav className="info-card mb-8">
          <div className="info-card-header">{t.tableOfContents}</div>
          <div className="info-card-body">
            <ol className="space-y-1.5">
              {guide.sections.map((section, i) => {
                const heading = isFr ? section.headingFr : section.heading
                return (
                  <li key={i}>
                    <a
                      href={`#${slugify(section.heading)}`}
                      className="text-[14px] text-[var(--accent)] hover:underline"
                    >
                      {i + 1}. {heading}
                    </a>
                  </li>
                )
              })}
            </ol>
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-8">
          {guide.sections.map((section, i) => {
            const heading = isFr ? section.headingFr : section.heading
            const content = isFr ? section.contentFr : section.content
            return (
              <section key={i} id={slugify(section.heading)}>
                <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{heading}</h2>
                <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{content}</p>
              </section>
            )
          })}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-6 border-t border-[var(--border)]">
          <Link
            href={`/${locale}/guide`}
            className="text-[14px] font-medium text-[var(--accent)] hover:underline"
          >
            &larr; {t.transitGuides}
          </Link>
        </div>
      </div>
    </>
  )
}
