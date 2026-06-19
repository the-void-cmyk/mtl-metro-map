import type { Metadata } from "next"
import Link from "next/link"
import { locales, getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import { generateBreadcrumbSchema } from "@/lib/seo"

// ---------------------------------------------------------------------------
// Affiliate links
// ---------------------------------------------------------------------------
// Stay22: ACTIVE. Downtown Montreal hotels map. AID mtlmetromap.
const STAY22_EMBED = "https://stay22.com/embed/6a32d087aa5b4cd4a2d09ca4"
// GetYourGuide: ACTIVE (2026-06-19). partner_id=O4R8HQT.
const GYG_LINK = "https://www.getyourguide.com/montreal-l195/?partner_id=O4R8HQT&utm_medium=online_publisher"

const SLUG = "where-to-stay"
const BASE = "https://mtlmetromap.com"

interface PageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const COPY = {
  en: {
    title: "Where to Stay in Montreal: Best Neighbourhoods by Metro Line",
    description:
      "Choose where to stay in Montreal based on metro access. Green and Orange lines for downtown, Old Montreal, and the Plateau. Hotels, tips, and a live price map.",
    intro:
      "Where you stay in Montreal shapes how easily you reach the things you came to do. The metro's four lines connect the main tourist areas within minutes of each other, but the right neighbourhood depends on whether you want walkable restaurants, waterfront views, or a quiet residential base. Here is the guide by line.",
    disclosure:
      "This guide links to booking partners we may earn a commission from, at no extra cost to you.",
    mapHeading: "Find hotels near the metro",
    mapBody:
      "Compare live prices across all neighbourhoods. The map is centred on the downtown core, with hotels along the Green and Orange lines.",
    greenHeading: "Green Line: downtown, Old Montreal, and the Plateau",
    greenAreas: [
      {
        name: "Downtown core (Peel, McGill, Place-des-Arts)",
        body:
          "The densest concentration of hotels in the city. Central to everything: a short walk to Old Montreal, the Latin Quarter, the Bell Centre, the Quartier des spectacles, and every major metro interchange. Best pick for first-time visitors who want to minimise transit time.",
      },
      {
        name: "Plateau-Mont-Royal (Sherbrooke, Mont-Royal stations)",
        body:
          "Residential and lively at the same time. Boulevard Saint-Laurent and Avenue du Mont-Royal are lined with independent restaurants, cafes, vintage shops, and bars. Mont-Royal Park is a 15-minute walk uphill. Better value than downtown, with fewer chain hotels and more boutique options.",
      },
      {
        name: "Atwater / Lionel-Groulx",
        body:
          "Convenient for anyone arriving or departing via the 747 airport bus, which stops at Lionel-Groulx before continuing downtown. Atwater Market is walking distance. Quieter than the core, with residential streets and a few independent hotels.",
      },
    ],
    orangeHeading: "Orange Line: Mile End, Rosemont, and Old Montreal",
    orangeAreas: [
      {
        name: "Old Montreal (Square-Victoria-OACI, Champ-de-Mars)",
        body:
          "Cobblestone streets, the Old Port waterfront, and 18th-century architecture. The most atmospheric part of the city for a first visit. Hotels here fill quickly in summer; book early. A short walk to the Yellow Line for Jean-Drapeau Island.",
      },
      {
        name: "Mile End (Laurier station)",
        body:
          "The neighbourhood where Montreal's creative scene lives. Bagel shops, coffee roasters, independent bookstores, concert venues. A bit further from major tourist sites but worth it for the experience. Best for repeat visitors or longer stays.",
      },
      {
        name: "Rosemont (Rosemont station)",
        body:
          "Quieter and more affordable than downtown or Mile End. Good food scene along Masson Street and Beaubien Street. Easy Orange Line access to the Jean-Talon Market.",
      },
    ],
    blueHeading: "Blue Line: Outremont and Côte-des-Neiges",
    blueBody:
      "The Blue Line runs east-west across the northern part of the island, connecting at Snowdon, Jean-Talon, and Rosemont to the Orange Line. Outremont (Outremont station) is quiet and affluent, with French-speaking residential streets and good bistros. Côte-des-Neiges is one of Montreal's most multicultural neighbourhoods, convenient for the university hospital complex. Not the first choice for tourists who want to be near the main sights, but a good value alternative for longer stays.",
    yellowHeading: "Yellow Line: Jean-Drapeau Island and the South Shore",
    yellowBody:
      "Jean-Drapeau Island (Jean-Drapeau station) hosts the Formula 1 circuit, the Casino de Montréal, La Ronde amusement park, and large summer festivals. There are no hotels on the island itself; stay downtown and take the Yellow Line. Longueuil-Université-de-Sherbrooke is the South Shore terminus, useful for visiting Longueuil or the Promenades mall, but most tourists base themselves on the island of Montreal.",
    toursHeading: "Book activities from your hotel",
    toursBody:
      "Walking tours, bike tours, the Old Port, and guided Montreal experiences are all bookable through GetYourGuide. No cancellation fees on most activities.",
    toursCta: "Browse Montreal activities",
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        q: "Which area of Montreal is best for tourists to stay in?",
        a: "Downtown (Green and Orange lines) is the safest all-round pick: central, hotel-dense, and within walking distance of Old Montreal, the Latin Quarter, and the Bell Centre. The Plateau is better for food and atmosphere but requires more metro use to reach tourist sites.",
      },
      {
        q: "Is it safe to stay near the metro in Montreal?",
        a: "Yes. All areas served by the metro are considered safe for tourists. The metro itself is monitored and well-lit. Standard city precautions apply late at night.",
      },
      {
        q: "How early does the Montreal metro start running?",
        a: "Trains run from approximately 5:30 AM on weekdays. On Friday and Saturday nights the metro runs until around 1:30 AM. Check the MTL Metro schedule for your specific line and station.",
      },
      {
        q: "Should I stay in Old Montreal or downtown?",
        a: "Old Montreal is more atmospheric and quieter, ideal for shorter stays focused on sightseeing and the waterfront. Downtown is more practical for a longer visit, with more transport connections, restaurant variety, and accommodation options at different price points.",
      },
      {
        q: "What is the Plateau-Mont-Royal like for tourists?",
        a: "The Plateau is one of Montreal's most distinctive neighbourhoods: colourful duplexes with spiral staircases, independent restaurants, and a strong cafe culture. It requires one or two metro stops to reach major tourist sites but is worth it for the local atmosphere.",
      },
    ],
  },
  fr: {
    title: "Où séjourner à Montréal : les meilleurs quartiers par ligne de métro",
    description:
      "Choisissez où séjourner à Montréal selon l'accès au métro. Lignes verte et orange pour le centre-ville, le Vieux-Montréal et le Plateau. Carte de prix en temps réel.",
    intro:
      "L'endroit où vous séjournez à Montréal détermine facilement vous accédez à ce que vous êtes venu faire. Les quatre lignes du métro relient les principales zones touristiques en quelques minutes, mais le bon quartier dépend de si vous souhaitez des restaurants à portée de marche, la vue sur le fleuve ou une base résidentielle tranquille. Voici le guide par ligne.",
    disclosure:
      "Ce guide renvoie à des partenaires de réservation dont nous pouvons toucher une commission, sans frais supplémentaires pour vous.",
    mapHeading: "Trouver des hôtels près du métro",
    mapBody:
      "Comparez les prix en temps réel dans tous les quartiers. La carte est centrée sur le coeur du centre-ville, avec les hôtels le long des lignes verte et orange.",
    greenHeading: "Ligne verte : centre-ville, Vieux-Montréal et Plateau",
    greenAreas: [
      {
        name: "Centre-ville (stations Peel, McGill, Place-des-Arts)",
        body:
          "La plus forte concentration d'hôtels de la ville. Central pour tout : à courte marche du Vieux-Montréal, du Quartier latin, du Centre Bell, du Quartier des spectacles et de chaque grande correspondance de métro. Meilleur choix pour les premiers visiteurs qui veulent minimiser les déplacements.",
      },
      {
        name: "Plateau-Mont-Royal (stations Sherbrooke, Mont-Royal)",
        body:
          "Résidentiel et animé à la fois. Le boulevard Saint-Laurent et l'avenue du Mont-Royal sont bordés de restaurants indépendants, de cafés, de boutiques vintage et de bars. Le Parc du Mont-Royal est à 15 minutes à pied en montant. Meilleur rapport qualité-prix que le centre-ville, avec moins d'hôtels de chaîne et plus d'options boutique.",
      },
      {
        name: "Atwater / Lionel-Groulx",
        body:
          "Pratique pour ceux qui arrivent ou repartent par la navette 747, qui s'arrête à Lionel-Groulx avant de continuer vers le centre-ville. Le Marché Atwater est à distance de marche. Plus calme que le coeur de la ville, avec des rues résidentielles et quelques hôtels indépendants.",
      },
    ],
    orangeHeading: "Ligne orange : Mile End, Rosemont et Vieux-Montréal",
    orangeAreas: [
      {
        name: "Vieux-Montréal (stations Square-Victoria-OACI, Champ-de-Mars)",
        body:
          "Rues pavées, Vieux-Port sur le fleuve et architecture du XVIIIe siècle. La partie la plus pittoresque de la ville pour une première visite. Les hôtels s'y remplissent rapidement en été; réservez à l'avance. À courte marche de la ligne jaune pour l'Île Jean-Drapeau.",
      },
      {
        name: "Mile End (station Laurier)",
        body:
          "Le quartier où vit la scène créative de Montréal. Boulangeries à bagels, torréfacteurs, librairies indépendantes, salles de concert. Un peu plus loin des grands sites touristiques, mais l'expérience en vaut la peine. Idéal pour les visiteurs réguliers ou les séjours prolongés.",
      },
      {
        name: "Rosemont (station Rosemont)",
        body:
          "Plus calme et plus abordable que le centre-ville ou le Mile End. Belle scène gastronomique sur les rues Masson et Beaubien. Accès facile en ligne orange au Marché Jean-Talon.",
      },
    ],
    blueHeading: "Ligne bleue : Outremont et Côte-des-Neiges",
    blueBody:
      "La ligne bleue traverse d'est en ouest la partie nord de l'île, avec des correspondances à Snowdon, Jean-Talon et Rosemont vers la ligne orange. Outremont (station Outremont) est un quartier tranquille et aisé, avec des rues résidentielles francophones et de bons bistrots. Côte-des-Neiges est l'un des quartiers les plus multiculturels de Montréal, pratique pour le complexe universitaire hospitalier. Pas le premier choix pour les touristes qui veulent être près des principaux sites, mais une alternative abordable pour les longs séjours.",
    yellowHeading: "Ligne jaune : Île Jean-Drapeau et Rive-Sud",
    yellowBody:
      "L'Île Jean-Drapeau (station Jean-Drapeau) accueille le circuit de Formule 1, le Casino de Montréal, La Ronde et de grands festivals estivaux. Il n'y a pas d'hôtels sur l'île; séjournez au centre-ville et prenez la ligne jaune. Longueuil-Université-de-Sherbrooke est le terminus de la Rive-Sud, utile pour visiter Longueuil ou les Promenades. La plupart des touristes se basent sur l'île de Montréal.",
    toursHeading: "Réservez des activités depuis votre hôtel",
    toursBody:
      "Balades guidées, tours en vélo, le Vieux-Port et des expériences à Montréal sont tous réservables sur GetYourGuide. Sans frais d'annulation pour la plupart des activités.",
    toursCta: "Voir les activités à Montréal",
    faqHeading: "Questions fréquentes",
    faqs: [
      {
        q: "Quel quartier de Montréal est le meilleur pour les touristes ?",
        a: "Le centre-ville (lignes verte et orange) est le choix le plus polyvalent : central, riche en hôtels et à distance de marche du Vieux-Montréal, du Quartier latin et du Centre Bell. Le Plateau est meilleur pour la gastronomie et l'atmosphère, mais nécessite plus de déplacements en métro.",
      },
      {
        q: "Est-il sûr de séjourner près du métro à Montréal ?",
        a: "Oui. Tous les quartiers desservis par le métro sont considérés comme sûrs pour les touristes. Le métro lui-même est surveillé et bien éclairé. Les précautions habituelles en ville s'appliquent tard le soir.",
      },
      {
        q: "À quelle heure le métro de Montréal commence-t-il à circuler ?",
        a: "Les trains circulent à partir d'environ 5 h 30 en semaine. Les vendredis et samedis soirs, le métro fonctionne jusqu'à environ 1 h 30. Consultez les horaires MTL Metro pour votre ligne et station spécifiques.",
      },
      {
        q: "Vaut-il mieux séjourner au Vieux-Montréal ou au centre-ville ?",
        a: "Le Vieux-Montréal est plus pittoresque et calme, idéal pour un court séjour axé sur la visite et le bord de l'eau. Le centre-ville est plus pratique pour un séjour plus long, avec plus de connexions de transport, de choix de restaurants et d'options d'hébergement à différents prix.",
      },
      {
        q: "Comment est le Plateau-Mont-Royal pour les touristes ?",
        a: "Le Plateau est l'un des quartiers les plus distinctifs de Montréal : duplex colorés avec escaliers en colimaçon, restaurants indépendants et forte culture café. Il faut une ou deux stations de métro pour atteindre les grands sites touristiques, mais l'atmosphère locale en vaut la peine.",
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

export default async function WhereToStay({ params }: PageProps) {
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

        <p className="text-[13px] text-[var(--text-muted)] mb-6">{c.disclosure}</p>

        {/* Stay22 hotel map */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.mapHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed mb-4">{c.mapBody}</p>
          <div className="info-card overflow-hidden">
            <iframe
              src={`${STAY22_EMBED}?lang=${locale}`}
              title={c.mapHeading}
              className="w-full"
              style={{ height: 480, border: "none" }}
              loading="lazy"
            />
          </div>
        </section>

        {/* Green Line */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-4">{c.greenHeading}</h2>
          <div className="space-y-5">
            {c.greenAreas.map((area, i) => (
              <div key={i} className="info-card">
                <div className="info-card-header flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#00A651" }} />
                  {area.name}
                </div>
                <div className="info-card-body">
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{area.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orange Line */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-4">{c.orangeHeading}</h2>
          <div className="space-y-5">
            {c.orangeAreas.map((area, i) => (
              <div key={i} className="info-card">
                <div className="info-card-header flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#F58220" }} />
                  {area.name}
                </div>
                <div className="info-card-body">
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{area.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Blue Line */}
        <section className="mb-8">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.blueHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{c.blueBody}</p>
        </section>

        {/* Yellow Line */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-semibold tracking-tight mb-3">{c.yellowHeading}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{c.yellowBody}</p>
        </section>

        {/* GetYourGuide */}
        <section className="info-card mb-10">
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
