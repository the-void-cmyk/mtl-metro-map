import Link from "next/link"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale?: Locale
}

export default function Breadcrumbs({ items, locale = 'en' }: BreadcrumbsProps) {
  const t = getTranslations(locale)

  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-[var(--text-muted)]">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href={`/${locale}`} className="hover:text-[var(--text-primary)] transition-colors">
            {t.home}
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-[var(--border)]">
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {i === items.length - 1 ? (
              <span className="text-[var(--text-secondary)] font-medium">{item.name}</span>
            ) : (
              <Link href={item.url} className="hover:text-[var(--text-primary)] transition-colors">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
