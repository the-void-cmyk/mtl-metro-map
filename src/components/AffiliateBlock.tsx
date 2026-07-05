import AffiliateLink from "./AffiliateLink"
import type { Locale } from "@/lib/i18n"

// Reusable "planning your visit" affiliate block: an eSIM (Saily) and a tours
// (GetYourGuide) CTA. Placed on high-traffic informational pages (OPUS card
// guide, fares, etc.) where the dedicated money pages get little traffic.
const SAILY = "https://go.saily.site/aff_c?offer_id=101&aff_id=14831"
const GYG = "https://www.getyourguide.com/montreal-l195/?partner_id=O4R8HQT&utm_medium=online_publisher"

export default function AffiliateBlock({
  locale,
  placement,
  className = "",
}: {
  locale: Locale
  placement: string
  className?: string
}) {
  const isFr = locale === "fr"
  const cta =
    "block w-full text-center text-[13px] font-semibold px-4 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"

  return (
    <div className={`info-card ${className}`}>
      <div className="info-card-header">{isFr ? "Préparez votre visite" : "Planning your visit?"}</div>
      <div className="info-card-body space-y-2.5">
        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
          {isFr ? "Deux essentiels pour les visiteurs à Montréal :" : "Two essentials for visitors to Montreal:"}
        </p>
        <AffiliateLink href={SAILY} partner="saily" placement={placement} className={`${cta} bg-[#7B2FF7]`}>
          {isFr ? "Carte eSIM Canada : données mobiles" : "Canada eSIM: mobile data"}
        </AffiliateLink>
        <AffiliateLink href={GYG} partner="getyourguide" placement={placement} className={`${cta} bg-[#FF5533]`}>
          {isFr ? "Visites et activités à Montréal" : "Montreal tours & activities"}
        </AffiliateLink>
        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
          {isFr
            ? "Liens partenaires : nous pouvons toucher une commission, sans frais pour vous."
            : "Partner links: we may earn a commission at no extra cost to you."}
        </p>
      </div>
    </div>
  )
}
