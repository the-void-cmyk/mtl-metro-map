import type { Metadata } from "next"
import Link from "next/link"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"

interface FaresPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: FaresPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Tarifs et zones' : 'Fares & Zones',
    description: locale === 'fr'
      ? 'Tarifs du transport en commun de Montreal. Zones ARTM, passes mensuelles, tarifs reduits et modes de paiement.'
      : 'Montreal transit fares. ARTM fare zones, monthly passes, reduced fares, and payment methods.',
  }
}

const zones = [
  { id: 'A', price: 3.75, monthly: 94.00 },
  { id: 'AB', price: 5.25, monthly: 132.50 },
  { id: 'ABC', price: 7.00, monthly: 176.00 },
  { id: 'ABCD', price: 9.25, monthly: 220.50 },
]

export default async function FaresPage({ params }: FaresPageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const isFr = locale === 'fr'

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ name: t.faresZones, url: `/${locale}/fares` }]}
        locale={locale as Locale}
      />

      <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight mt-5 mb-2">
        {t.faresZones}
      </h1>
      <p className="text-[var(--text-secondary)] text-[15px] mb-8">
        {t.fareZonesSubtitle}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Zone pricing table */}
          <div className="info-card">
            <div className="info-card-header">
              {isFr ? 'Tarif par zone' : 'Fare by Zone'}
            </div>
            <div className="info-card-body p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Zone</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        {isFr ? 'Couverture' : 'Coverage'}
                      </th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        {isFr ? 'Aller simple' : 'Single Trip'}
                      </th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                        {isFr ? 'Mensuel' : 'Monthly'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map((zone) => (
                      <tr key={zone.id} className="border-b border-[var(--border-subtle)] last:border-0">
                        <td className="px-5 py-3.5">
                          <span className="font-heading font-semibold">{zone.id}</span>
                        </td>
                        <td className="px-5 py-3.5 text-[var(--text-secondary)]">
                          {zone.id === 'A' && (isFr ? 'Ile de Montreal' : 'Island of Montreal')}
                          {zone.id === 'AB' && (isFr ? 'Montreal + Laval/Longueuil' : 'Montreal + Laval/Longueuil')}
                          {zone.id === 'ABC' && (isFr ? 'Montreal + banlieue proche' : 'Montreal + Inner Suburbs')}
                          {zone.id === 'ABCD' && (isFr ? 'Reseau complet' : 'Full Network')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-heading font-semibold tabular-nums">${zone.price.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-right font-heading tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">${zone.monthly.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Monthly passes (mobile only, since hidden in table on mobile) */}
          <div className="info-card sm:hidden">
            <div className="info-card-header">
              {isFr ? 'Passes mensuelles' : 'Monthly Passes'}
            </div>
            <div className="info-card-body">
              <dl className="space-y-3 text-[14px]">
                {zones.map((zone) => (
                  <div key={zone.id} className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Zone {zone.id}</dt>
                    <dd className="font-heading font-medium tabular-nums">${zone.monthly.toFixed(2)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Reduced fares */}
          <div className="info-card">
            <div className="info-card-header">
              {isFr ? 'Tarifs reduits' : 'Reduced Fares'}
            </div>
            <div className="info-card-body">
              <div className="flex justify-between items-start text-[14px]">
                <div>
                  <p className="font-medium">
                    {isFr ? 'Tarif reduit Zone A' : 'Reduced Fare Zone A'}
                  </p>
                  <p className="text-[var(--text-muted)] text-[13px] mt-0.5">
                    {isFr ? '6-17 ans, 65 ans et plus' : '6-17 years, 65+'}
                  </p>
                </div>
                <span className="font-heading font-semibold tabular-nums">$2.50</span>
              </div>
              <div className="h-px bg-[var(--border)] my-3" />
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {isFr
                  ? 'Les enfants de 5 ans et moins voyagent gratuitement. Un maximum de 2 enfants par adulte payant.'
                  : 'Children 5 and under ride free. Maximum 2 children per paying adult.'}
              </p>
            </div>
          </div>

          {/* How zones work */}
          <div className="info-card">
            <div className="info-card-header">
              {isFr ? 'Comment fonctionnent les zones' : 'How Zones Work'}
            </div>
            <div className="info-card-body text-[14px] text-[var(--text-secondary)] leading-relaxed space-y-3">
              <p>
                {isFr
                  ? "Le systeme ARTM utilise des zones concentriques autour de Montreal. Votre tarif depend des zones traversees durant votre trajet, pas du nombre de correspondances."
                  : 'The ARTM system uses concentric zones around Montreal. Your fare depends on which zones you travel through, not the number of transfers.'}
              </p>
              <p>
                {isFr
                  ? 'Un seul billet est valide 120 minutes sur tous les modes de transport : metro, REM, bus et trains de banlieue Exo.'
                  : 'A single ticket is valid for 120 minutes across all transit modes: Metro, REM, bus, and Exo commuter trains.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="info-card">
            <div className="info-card-header">
              {isFr ? 'Modes de paiement' : 'Payment Methods'}
            </div>
            <div className="info-card-body space-y-3 text-[14px]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-inset)] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--text-secondary)]" aria-hidden="true">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 10h20" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{isFr ? 'Carte OPUS' : 'OPUS Card'}</p>
                  <p className="text-[12px] text-[var(--text-muted)]">{isFr ? 'Carte rechargeable' : 'Rechargeable card'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-inset)] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--text-secondary)]" aria-hidden="true">
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">{isFr ? 'Sans contact' : 'Contactless'}</p>
                  <p className="text-[12px] text-[var(--text-muted)]">{isFr ? 'Carte de credit/debit' : 'Credit/debit card'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              {isFr ? 'Bon a savoir' : 'Good to Know'}
            </div>
            <div className="info-card-body">
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{isFr ? 'Validite' : 'Validity'}</dt>
                  <dd className="font-medium">120 min</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{isFr ? 'Devise' : 'Currency'}</dt>
                  <dd className="font-medium">CAD ($)</dd>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">{isFr ? 'Reseaux inclus' : 'Networks'}</dt>
                  <dd className="font-medium">{isFr ? 'Tous' : 'All'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <Link href={`/${locale}/calculator`} className="info-card block group hover:border-[var(--accent)] transition-colors">
            <div className="info-card-body">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-inset)] flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--accent)]/10 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true">
                    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 6h8M8 10h8M8 14h3M13 14h3M8 18h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-heading font-semibold text-[14px] group-hover:text-[var(--accent)] transition-colors">
                    {t.costCalculator}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                    {t.costCalculatorDesc}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
