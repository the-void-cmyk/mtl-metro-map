import type { Metadata } from "next"
import Link from "next/link"
import { locales, getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import { generateBreadcrumbSchema } from "@/lib/seo"

// ---------------------------------------------------------------------------
// Affiliate links
// ---------------------------------------------------------------------------
// Saily: ACTIVE (approved 2026-06-19). 15% commission, aff_id=14831.
const SAILY_LINK = "https://go.saily.site/aff_c?offer_id=101&aff_id=14831"
// GetYourGuide: ACTIVE (2026-06-19). partner_id=O4R8HQT.
const GYG_LINK = "https://www.getyourguide.com/montreal-l195/?partner_id=O4R8HQT&utm_medium=online_publisher"
// Stay22: ACTIVE. Downtown Montreal hotels map. AID mtlmetromap.
const STAY22_EMBED = "https://stay22.com/embed/6a32d087aa5b4cd4a2d09ca4"

const SLUG = "visitor-guide"
const BASE = "https://mtlmetromap.com"

interface PageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const COPY = {
  en: {
    title: "Montreal Metro Guide for Visitors: Passes, Tours & Tips",
    description:
      "Everything tourists need to use the Montreal metro: the right transit pass, getting from the airport, what to do, and where to stay. All the practical info in one place.",
    intro:
      "The Montreal metro is the fastest way to get around the city. Four lines connect the airport bus, Old Montreal, downtown, the Plateau, and the Olympic Park. A single OPUS card covers the metro, the REM, and exo commuter trains in Zone A, so one tap gets you everywhere on the island. Here is what to sort out before you arrive.",
    disclosure:
      "This guide links to travel partners we may earn a commission from, at no extra cost to you.",
    esimHeading: "Stay connected from the moment you land",
    esimBody:
      "Canadian roaming charges are high. An eSIM installs on your phone before you fly and activates the moment you land, so you can open maps, book rides, or contact your accommodation before leaving the terminal.",
    esimCta: "Get a Canada eSIM",
    airportHeading: "Getting from YUL Airport to downtown",
    airportBody:
      "The 747 express bus runs 24 hours a day between the airport and Berri-UQAM metro station. A $11.25 ticket covers the bus and a full 24 hours on the metro. Taxis charge a flat rate of $49.45 (daytime) or $56.70 (overnight). Pre-booked private transfers from about $101 meet you at arrivals.",
    airportLink: "Full airport guide with times, prices, and booking",
    passesHeading: "Choosing the right transit pass",
    passesBody:
      "Buy an OPUS card ($6, reusable) at any metro station ticket machine and load whichever pass fits your visit. Contactless payment (credit or debit tap) also works at every turnstile if you prefer not to buy a card.",
    passesTableHead: ["Pass", "Price", "Best for"],
    passesRows: [
      ["Single trip", "$3.75", "One-off journey, Zone A"],
      ["1-day pass", "$11.25", "Airport day or a full day exploring"],
      ["Weekly pass (Mon–Sun)", "$29", "Stays of 4+ days"],
      ["Monthly pass", "$94", "Long stays or work trips"],
    ],
    passesNote:
      "Passes cover the STM metro and buses, the REM, and exo trains in Zone A. Transfers between these networks are included within a 120-minute window.",
    toursHeading: "Things to do in Montreal",
    toursBody:
      "The metro puts Old Montreal, the Latin Quarter, the Plateau, Mount Royal, the Olympic Park, and Jean-Drapeau Island all within a short walk of a station. Book walking tours, bike tours, and guided experiences through GetYourGuide.",
    toursCta: "Browse Montreal activities",
    hotelHeading: "Where to stay",
    hotelBody:
      "Most visitors stay along the Green and Orange lines in the downtown core, Old Montreal, or the Plateau. Use the map to compare live hotel prices across the city.",
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        q: "Do I need an OPUS card as a tourist in Montreal?",
        a: "Not strictly. Contactless credit or debit payment works at every metro turnstile and bus reader. An OPUS card is useful if you want a weekly pass or plan many short trips, since individual taps at $3.75 can add up.",
      },
      {
        q: "How much does a day pass cost for the Montreal metro?",
        a: "A 1-day pass costs $11.25 and covers unlimited travel on the STM metro, buses, the REM, and exo trains in Zone A for 24 hours.",
      },
      {
        q: "Is the Montreal metro safe for tourists?",
        a: "Yes. The metro is generally safe at all hours. Berri-UQAM and other large interchange stations are busy even late at night. Standard urban precautions apply.",
      },
      {
        q: "Does the Montreal metro go to the airport?",
        a: "The metro does not reach YUL directly. Take the 747 express bus from the airport to Lionel-Groulx or Berri-UQAM stations, then transfer to the metro. The REM airport station is under construction and expected around 2027.",
      },
      {
        q: "What is the best neighbourhood to stay in Montreal for tourists?",
        a: "Downtown (Green and Orange lines) is the most central and hotel-dense. Old Montreal is quieter and walkable to the waterfront. The Plateau (Mont-Royal station) is best for restaurants, cafes, and nightlife.",
      },
    ],
  },
  fr: {
    title: "Guide du métro de Montréal pour les visiteurs : passes, activités et conseils",
    description:
      "Tout ce que les touristes doivent savoir pour utiliser le métro de Montréal : le bon titre de transport, comment venir de l'aéroport, quoi faire et où séjourner.",
    intro:
      "Le métro de Montréal est le moyen le plus rapide de se déplacer dans la ville. Quatre lignes relient la navette de l'aéroport, le Vieux-Montréal, le centre-ville, le Plateau et le Parc olympique. Une seule carte OPUS couvre le métro, le REM et les trains exo en Zone A, donc un seul passage vous emmène partout sur l'île. Voici ce qu'il faut régler avant d'arriver.",
    disclosure:
      "Ce guide renvoie à des partenaires de voyage dont nous pouvons toucher une commission, sans frais supplémentaires pour vous.",
    esimHeading: "Restez connecté dès l'atterrissage",
    esimBody:
      "Les frais d'itinérance au Canada sont élevés. Une eSIM s'installe sur votre téléphone avant le départ et s'active dès l'atterrissage, pour consulter les cartes, réserver un transport ou contacter votre hébergement avant de quitter l'aérogare.",
    esimCta: "Obtenir une eSIM Canada",
    airportHeading: "Depuis l'aéroport YUL",
    airportBody:
      "La navette 747 circule 24 h sur 24 entre l'aéroport et la station Berri-UQAM. Un billet de 11,25 $ couvre la navette et une journée complète dans le métro. Les taxis ont un tarif fixe de 49,45 $ (jour) ou 56,70 $ (nuit). Les transferts privés réservés à l'avance à partir d'environ 101 $ vous accueillent aux arrivées.",
    airportLink: "Guide complet de l'aéroport avec horaires, prix et réservation",
    passesHeading: "Choisir le bon titre de transport",
    passesBody:
      "Achetez une carte OPUS (6 $, réutilisable) aux distributeurs dans n'importe quelle station et chargez-y le titre qui convient à votre séjour. Le paiement sans contact (carte de crédit ou de débit) fonctionne aussi à tous les tourniquets.",
    passesTableHead: ["Titre", "Prix", "Idéal pour"],
    passesRows: [
      ["Passage simple", "3,75 $", "Trajet unique, Zone A"],
      ["Passe 1 jour", "11,25 $", "Journée à l'aéroport ou en exploration"],
      ["Passe hebdomadaire (lun.–dim.)", "29 $", "Séjours de 4 jours ou plus"],
      ["Passe mensuelle", "94 $", "Longs séjours ou voyages d'affaires"],
    ],
    passesNote:
      "Les passes couvrent le métro et les bus STM, le REM et les trains exo en Zone A. Les correspondances entre ces réseaux sont incluses dans une fenêtre de 120 minutes.",
    toursHeading: "À faire à Montréal",
    toursBody:
      "Le métro vous mène à pied du Vieux-Montréal, du Quartier latin, du Plateau, du Mont-Royal, du Parc olympique et de l'Île Jean-Drapeau. Réservez des balades gastronomiques, des tours en vélo et des visites guidées sur GetYourGuide.",
    toursCta: "Voir les activités à Montréal",
    hotelHeading: "Où séjourner",
    hotelBody:
      "La plupart des visiteurs séjournent sur les lignes verte et orange, dans le centre-ville, le Vieux-Montréal ou le Plateau. Utilisez la carte pour comparer les prix des hôtels en temps réel.",
    faqHeading: "Questions fréquentes",
    faqs: [
      {
        q: "Ai-je besoin d'une carte OPUS comme touriste à Montréal ?",
        a: "Pas obligatoirement. Le paiement sans contact par carte bancaire fonctionne à tous les tourniquets du métro et lecteurs de bus. La carte OPUS est utile pour une passe hebdomadaire ou de nombreux trajets courts.",
      },
      {
        q: "Combien coûte une passe journalière pour le métro de Montréal ?",
        a: "Une passe 1 jour coûte 11,25 $ et permet des déplacements illimités sur le métro STM, les bus, le REM et les trains exo en Zone A pendant 24 heures.",
      },
      {
        q: "Le métro de Montréal est-il sûr pour les touristes ?",
        a: "Oui. Le métro est généralement sûr à toute heure. Les grandes stations de correspondance comme Berri-UQAM sont animées même tard le soir. Les précautions habituelles en milieu urbain s'appliquent.",
      },
      {
        q: "Le métro de Montréal se rend-il à l'aéroport ?",
        a: "Le métro n'atteint pas YUL directement. Prenez la navette 747 depuis l'aéroport jusqu'aux stations Lionel-Groulx ou Berri-UQAM, puis correspondez vers le métro. La station du REM à l'aéroport est en construction et attendue vers 2027.",
      },
      {
        q: "Quel est le meilleur quartier pour séjourner à Montréal en tant que touriste ?",
        a: "Le centre-ville (lignes verte et orange) est le plus central et concentre le plus d'hôtels. Le Vieux-Montréal est plus calme et facile à explorer à pied jusqu'au bord de l'eau. Le Plateau (station Mont-Royal) est idéal pour les restaurants, cafés et la vie nocturne.",
      },
    ],
  },
} as const

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale === "fr"
  const c = isFr ? COPY.fr : COPY.en
  const altLocale = isFr ? "en" : "fr"
  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical: `/${locale}/guide/${SLUG}`,
      languages: {
        [locale]: `/${locale}/guide/${SLUG}`,
        [altLocale]: `/${altLocale}/guide/${SLUG}`,
        "x-default": `/en/guide/${SLUG}`,
      },
    },
  }
}

export default async function VisitorGuide({ params }: PageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const isFr = locale === "fr"
  const c = isFr ? COPY.fr : COPY.en
  const url = `${BASE}/${locale}/guide/${SLUG}`

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    inLanguage: isFr ? "fr-CA" : "en-CA",
    publisher: { "@type": "Organization", name: "MTL Metro" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: t.transitGuides, url: `/${locale}/guide` },
      { name: c.title, url: `/${locale}/guide/${SLUG}` },
    ],
    BASE
  )

  return (
    <>
      {[articleSchema, faqSchema, breadcrumbSchema].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="max-w-3xl mx-auto px-5 py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { name: t.transitGuides, url: `/${locale}/guide` },
            { name: c.title, url: `/${locale}/guide/${SLUG}` },
          ]}
          locale={locale as Locale}
        />

        <div className="mt-6 mb-6">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">{c.title}</h1>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mt-3">{c.intro}</p>
        </div>

        <p className="text-[13px] text-[var(--text-muted)] mb-8">{c.disclosure}</p>

        {/* eSIM callout */}
        <section className="info-card mb-8">
          <div className="info-card-header">{c.esimHeading}</div>
          <div className="info-card-body">
            <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{c.esimBody}</p>
            <a
              href={SAILY_LINK}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 mt-4 bg-[var(--accent)] text-white font-semibold text-[14px] px-5 py-3 hover:opacity-90 transition-opacity"
            >
              {c.esimCta} &rarr;
            </a>
          </div>
        </section>

        {/* Airport section */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.airportHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-3">{c.airportBody}</p>
          <Link
            href={`/${locale}/guide/yul-airport-to-downtown`}
            className="text-[14px] font-medium text-[var(--accent)] hover:underline"
          >
            {c.airportLink} &rarr;
          </Link>
        </section>

        {/* Passes */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.passesHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-4">{c.passesBody}</p>
          <div className="info-card overflow-x-auto mb-3">
            <table className="w-full text-[14px] border-collapse">
              <thead>
                <tr className="text-left text-[var(--text-muted)]">
                  {c.passesTableHead.map((h) => (
                    <th key={h} className="px-4 py-2.5 border-b-2 border-[var(--border)] font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.passesRows.map((row, i) => (
                  <tr key={i} className="text-[var(--text-secondary)]">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2.5 border-b border-[var(--border)] align-top">
                        {j === 0 ? <span className="font-medium text-[var(--text-primary)]">{cell}</span> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">{c.passesNote}</p>
        </section>

        {/* GetYourGuide */}
        <section className="info-card mb-8">
          <div className="info-card-header">{c.toursHeading}</div>
          <div className="info-card-body">
            <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{c.toursBody}</p>
            <a
              href={GYG_LINK}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 mt-4 bg-[#FF5533] text-white font-semibold text-[14px] px-5 py-3 hover:opacity-90 transition-opacity"
            >
              {c.toursCta} &rarr;
            </a>
          </div>
        </section>

        {/* Stay22 hotel map */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.hotelHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-4">{c.hotelBody}</p>
          <div className="info-card overflow-hidden">
            <iframe
              src={`${STAY22_EMBED}?lang=${locale}`}
              title={c.hotelHeading}
              className="w-full"
              style={{ height: 480, border: "none" }}
              loading="lazy"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-4">{c.faqHeading}</h2>
          <div className="space-y-5">
            {c.faqs.map((f, i) => (
              <div key={i}>
                <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{f.q}</h3>
                <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

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
