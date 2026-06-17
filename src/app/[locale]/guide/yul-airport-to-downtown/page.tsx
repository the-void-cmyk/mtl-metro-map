import type { Metadata } from "next"
import Link from "next/link"
import { locales, getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import { generateBreadcrumbSchema } from "@/lib/seo"

// ---------------------------------------------------------------------------
// Affiliate links. Update these as programs approve.
// Source of truth + status: docs/yul-airport-to-downtown-page-draft.md
// ---------------------------------------------------------------------------
// Kiwitaxi: ACTIVE. pap=ozhx8mipof6vz tracks on any kiwitaxi.com page.
const KIWITAXI_LINK = "https://kiwitaxi.com/en/canada/montreal-airport-transfers?pap=ozhx8mipof6vz"
// Airalo: affiliate application PENDING approval. Interim link is untracked
// (no commission until the approved tracking link is pasted here).
const AIRALO_LINK = "https://www.airalo.com/canada-esim"
// Stay22: ACTIVE. "Downtown Montreal hotels" map (centered on Gare Centrale,
// AID mtlmetromap). Generated in the Stay22 Hub > Maps tool.
const STAY22_MAP_EMBED = "https://stay22.com/embed/6a32d087aa5b4cd4a2d09ca4"

const SLUG = "yul-airport-to-downtown"
const BASE = "https://mtlmetromap.com"

interface PageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const COPY = {
  en: {
    title: "Getting from YUL Airport to Downtown Montreal",
    description:
      "How to get from Montreal-Trudeau (YUL) to downtown: the 747 bus ($11.25), taxi (flat $49.45), and private transfer, with times, prices, and what to do the moment you land.",
    intro:
      "From Montreal-Trudeau Airport (YUL), the cheapest way downtown is the 747 express bus: $11.25 for a 24-hour pass that also covers the metro, running 24/7, with a ride of about 45 to 60 minutes. For a faster, door-to-door trip, a flat-rate taxi costs $49.45 (or $56.70 overnight), and a pre-booked private transfer starts around $101. The REM train does not reach the airport yet (its station is expected around 2027). Whatever you choose, get connected before you leave the terminal.",
    disclosure:
      "This guide links to travel partners we may earn a commission from, at no extra cost to you.",
    esimHeading: "Land with working data",
    esimBody:
      "Canadian roaming is expensive. An eSIM activates the moment you land, before you even leave the gate, so you can pull up directions, book a ride, or message your hotel. Install it before you fly and switch it on when you arrive.",
    esimCta: "Get a Canada eSIM",
    optionsHeading: "Your options at a glance",
    tableHead: ["Option", "Time", "Price", "Best for"],
    rows: [
      ["747 express bus", "45-60 min", "$11.25 (24h pass)", "Cheapest, runs 24/7"],
      ["Taxi (flat rate)", "20-45 min", "$49.45 / $56.70 night", "Direct, no planning"],
      ["Private transfer", "20-45 min", "from $101", "Luggage, groups, meet and greet"],
      ["REM train", "not yet", "opens ~2027", "Not available from YUL yet"],
    ],
    options: [
      {
        heading: "Option 1: The 747 express bus (cheapest)",
        body:
          "The 747 runs 24 hours a day between the airport and downtown, stopping at Lionel-Groulx and Berri-UQAM metro stations. Since January 2026 the downtown terminus is on Rene-Levesque Boulevard at Berri Street. A single 747 fare is $11.25 and doubles as a 24-hour pass across the STM metro and bus, the REM, and exo trains in Zone A, so your ride downtown and your first day of local trips are covered by one ticket. Buy it with the Chrono app, at a fare machine, or at the STM counter in the international arrivals hall. If you pay cash on the bus, bring exact change.",
      },
      {
        heading: "Option 2: Taxi (flat rate)",
        body:
          "Taxis from YUL to downtown charge a fixed flat rate set by the airport: $49.45 between 5 a.m. and 11 p.m., and $56.70 between 11 p.m. and 5 a.m., before tip. The ride takes about 20 to 45 minutes depending on traffic. Taxis wait at the stand outside arrivals, with no booking needed.",
      },
      {
        heading: "Option 3: Pre-booked private transfer",
        body:
          "If you are arriving late, travelling with kids, or simply do not want to wrangle luggage on a bus, a pre-booked private transfer meets you at arrivals with a fixed price you see before you pay. Kiwitaxi covers YUL from about $101 per vehicle, with an English or French speaking driver.",
        cta: { label: "Book a private transfer", href: KIWITAXI_LINK },
      },
      {
        heading: "What about the REM?",
        body:
          "The REM light rail will eventually link the airport directly to downtown, but the airport station is still under construction and is expected to open around 2027. Until then, the 747 bus is the best public-transit option from YUL.",
      },
    ],
    hotelHeading: "Where to stay downtown",
    hotelBody:
      "Most visitors base themselves around the downtown core and Old Montreal, on the Green and Orange metro lines, a short ride from where the 747 and taxis drop you. Use the map to compare live prices near Gare Centrale.",
    hotelPlaceholder: "Hotel map (Stay22) loads here once the embed is added.",
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        q: "How much is the 747 bus from YUL to downtown?",
        a: "The 747 costs $11.25, which is a 24-hour pass valid on the STM metro and bus, the REM, and exo trains in Zone A. It runs 24 hours a day.",
      },
      {
        q: "How much is a taxi from Montreal airport to downtown?",
        a: "Taxis charge a fixed flat rate: $49.45 from 5 a.m. to 11 p.m., and $56.70 from 11 p.m. to 5 a.m., before tip. The ride takes about 20 to 45 minutes.",
      },
      {
        q: "Does the REM go to Montreal airport?",
        a: "Not yet. The REM airport station is under construction and expected to open around 2027. For now, take the 747 bus, a taxi, or a private transfer.",
      },
      {
        q: "What is the cheapest way from YUL to downtown?",
        a: "The 747 express bus at $11.25 is the cheapest option, and the fare doubles as a 24-hour transit pass.",
      },
      {
        q: "Do I need a SIM card or eSIM in Montreal?",
        a: "An eSIM is the easiest way to have data the moment you land, without roaming fees. Install it before you fly and activate it on arrival.",
      },
    ],
  },
  fr: {
    title: "Se rendre de l'aéroport YUL au centre-ville de Montréal",
    description:
      "Comment aller de Montreal-Trudeau (YUL) au centre-ville : la navette 747 (11,25 $), le taxi (tarif fixe 49,45 $) et le transfert privé, avec durées, prix et quoi faire dès l'atterrissage.",
    intro:
      "Depuis l'aéroport Montreal-Trudeau (YUL), le moyen le moins cher pour rejoindre le centre-ville est la navette 747 : 11,25 $ pour un titre de 24 heures qui couvre aussi le métro, en service 24 h sur 24, avec un trajet d'environ 45 à 60 minutes. Pour un trajet plus rapide et porte-à-porte, un taxi à tarif fixe coûte 49,45 $ (ou 56,70 $ la nuit), et un transfert privé réservé à l'avance débute autour de 101 $. Le REM ne dessert pas encore l'aéroport (sa station est attendue vers 2027). Quoi que vous choisissiez, connectez-vous avant de quitter l'aérogare.",
    disclosure:
      "Ce guide renvoie à des partenaires de voyage dont nous pouvons toucher une commission, sans frais supplémentaires pour vous.",
    esimHeading: "Atterrissez avec des données",
    esimBody:
      "L'itinérance au Canada coûte cher. Une eSIM s'active dès l'atterrissage, avant même de quitter la porte, pour consulter l'itinéraire, réserver un transport ou écrire à votre hôtel. Installez-la avant le départ et activez-la à l'arrivée.",
    esimCta: "Obtenir une eSIM Canada",
    optionsHeading: "Vos options en un coup d'oeil",
    tableHead: ["Option", "Durée", "Prix", "Idéal pour"],
    rows: [
      ["Navette 747", "45-60 min", "11,25 $ (passe 24 h)", "Le moins cher, 24 h/24"],
      ["Taxi (tarif fixe)", "20-45 min", "49,45 $ / 56,70 $ nuit", "Direct, sans planification"],
      ["Transfert privé", "20-45 min", "dès 101 $", "Bagages, groupes, accueil"],
      ["Train REM", "pas encore", "vers 2027", "Pas encore disponible depuis YUL"],
    ],
    options: [
      {
        heading: "Option 1 : la navette 747 (la moins chère)",
        body:
          "La navette 747 circule 24 h sur 24 entre l'aéroport et le centre-ville, avec arrêts aux stations de métro Lionel-Groulx et Berri-UQAM. Depuis janvier 2026, le terminus du centre-ville se trouve sur le boulevard René-Lévesque à la hauteur de la rue Berri. Un passage 747 coûte 11,25 $ et sert de titre de 24 heures sur le métro et les bus de la STM, le REM et les trains exo en zone A : votre trajet vers le centre-ville et votre première journée de déplacements sont couverts par un seul billet. Achetez-le avec l'application Chrono, à une distributrice ou au comptoir de la STM dans le hall des arrivées internationales. Si vous payez comptant dans l'autobus, prévoyez l'appoint exact.",
      },
      {
        heading: "Option 2 : taxi (tarif fixe)",
        body:
          "Les taxis de YUL vers le centre-ville facturent un tarif fixe établi par l'aéroport : 49,45 $ entre 5 h et 23 h, et 56,70 $ entre 23 h et 5 h, avant le pourboire. Le trajet prend environ 20 à 45 minutes selon la circulation. Les taxis attendent à la station devant les arrivées, sans réservation.",
      },
      {
        heading: "Option 3 : transfert privé réservé à l'avance",
        body:
          "Si vous arrivez tard, voyagez avec des enfants ou ne voulez pas gérer vos bagages dans l'autobus, un transfert privé réservé à l'avance vous accueille aux arrivées avec un prix fixe connu avant le paiement. Kiwitaxi dessert YUL à partir d'environ 101 $ par véhicule, avec un chauffeur parlant français ou anglais.",
        cta: { label: "Réserver un transfert privé", href: KIWITAXI_LINK },
      },
      {
        heading: "Et le REM ?",
        body:
          "Le train léger REM reliera éventuellement l'aéroport directement au centre-ville, mais la station de l'aéroport est encore en construction et son ouverture est attendue vers 2027. D'ici là, la navette 747 demeure la meilleure option de transport en commun depuis YUL.",
      },
    ],
    hotelHeading: "Où loger au centre-ville",
    hotelBody:
      "La plupart des visiteurs logent autour du centre-ville et du Vieux-Montréal, sur les lignes verte et orange du métro, à courte distance de l'endroit où la 747 et les taxis vous déposent. Utilisez la carte pour comparer les prix en temps réel près de la Gare Centrale.",
    hotelPlaceholder: "La carte des hôtels (Stay22) s'affichera ici une fois l'intégration ajoutée.",
    faqHeading: "Questions fréquentes",
    faqs: [
      {
        q: "Combien coûte la navette 747 de YUL au centre-ville ?",
        a: "La 747 coûte 11,25 $, soit un titre de 24 heures valide sur le métro et les bus de la STM, le REM et les trains exo en zone A. Elle circule 24 h sur 24.",
      },
      {
        q: "Combien coûte un taxi de l'aéroport de Montréal au centre-ville ?",
        a: "Les taxis appliquent un tarif fixe : 49,45 $ de 5 h à 23 h, et 56,70 $ de 23 h à 5 h, avant le pourboire. Le trajet prend environ 20 à 45 minutes.",
      },
      {
        q: "Le REM se rend-il à l'aéroport de Montréal ?",
        a: "Pas encore. La station du REM à l'aéroport est en construction et son ouverture est attendue vers 2027. Pour l'instant, prenez la navette 747, un taxi ou un transfert privé.",
      },
      {
        q: "Quel est le moyen le moins cher de YUL au centre-ville ?",
        a: "La navette 747 à 11,25 $ est l'option la moins chère, et le tarif sert aussi de passe de transport de 24 heures.",
      },
      {
        q: "Ai-je besoin d'une carte SIM ou d'une eSIM à Montréal ?",
        a: "Une eSIM est le moyen le plus simple d'avoir des données dès l'atterrissage, sans frais d'itinérance. Installez-la avant le départ et activez-la à l'arrivée.",
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

export default async function YulAirportGuide({ params }: PageProps) {
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

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: c.title,
    description: c.description,
    step: c.options
      .filter((o) => !o.heading.toLowerCase().includes("rem"))
      .map((o, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: o.heading,
        text: o.body,
      })),
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
      {[articleSchema, howToSchema, faqSchema, breadcrumbSchema].map((schema, i) => (
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

        {/* eSIM callout: highest arrival intent */}
        <section className="info-card mb-8">
          <div className="info-card-header">{c.esimHeading}</div>
          <div className="info-card-body">
            <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{c.esimBody}</p>
            <a
              href={AIRALO_LINK}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 mt-4 bg-[var(--accent)] text-white font-semibold text-[14px] px-5 py-3 hover:opacity-90 transition-opacity"
            >
              {c.esimCta} &rarr;
            </a>
          </div>
        </section>

        {/* Options at a glance */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.optionsHeading}</h2>
          <div className="info-card overflow-x-auto">
            <table className="w-full text-[14px] border-collapse">
              <thead>
                <tr className="text-left text-[var(--text-muted)]">
                  {c.tableHead.map((h) => (
                    <th key={h} className="px-4 py-2.5 border-b-2 border-[var(--border)] font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.rows.map((row, i) => (
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
        </section>

        {/* Detailed options */}
        <div className="space-y-8">
          {c.options.map((o, i) => (
            <section key={i}>
              <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{o.heading}</h2>
              <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{o.body}</p>
              {"cta" in o && o.cta && (
                <a
                  href={o.cta.href}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-1.5 mt-4 bg-[var(--accent)] text-white font-semibold text-[14px] px-5 py-3 hover:opacity-90 transition-opacity"
                >
                  {o.cta.label} &rarr;
                </a>
              )}
            </section>
          ))}
        </div>

        {/* Where to stay (Stay22 map) */}
        <section className="mt-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.hotelHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-4">{c.hotelBody}</p>
          {STAY22_MAP_EMBED ? (
            <div className="info-card overflow-hidden">
              <iframe
                src={`${STAY22_MAP_EMBED}?lang=${locale}`}
                title={c.hotelHeading}
                className="w-full"
                style={{ height: 480, border: "none" }}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="info-card">
              <div
                className="info-card-body text-[13px] text-[var(--text-muted)] text-center"
                style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {c.hotelPlaceholder}
              </div>
            </div>
          )}
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
