import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: {
    default: "MTL Metro - Montreal Metro Route Finder",
    template: "%s | MTL Metro",
  },
  description:
    "Find the fastest route across Montreal's Metro, REM, and Exo commuter train network. 138 stations, real-time routes, fares, and schedules.",
  keywords: [
    "Montreal Metro",
    "STM",
    "REM",
    "Exo",
    "route finder",
    "transit",
    "subway",
    "commuter train",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "MTL Metro",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MTL Metro",
              url: "https://mtlmetro.com",
              description:
                "Montreal Metro route finder. Plan your trip across Metro, REM, and Exo commuter trains.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://mtlmetro.com/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <header className="bg-white/80 backdrop-blur-lg border-b border-[var(--border)] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[var(--hero-bg)] flex items-center justify-center transition-transform group-hover:scale-105">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 .67 3 1.5S13.66 8 12 8s-3-.67-3-1.5S10.34 5 12 5zM7 19v-2c0-2.76 4-4 5-4s5 1.24 5 4v2H7z" fill="currentColor"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/>
                </svg>
              </div>
              <span className="font-heading font-semibold text-[17px] tracking-tight">MTL Metro</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href="/map" className="px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors">
                Map
              </Link>
              <Link href="/fares" className="px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors">
                Fares
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[var(--border)] bg-white py-10 mt-auto">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <p className="font-heading font-semibold text-sm tracking-tight">MTL Metro</p>
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                  Montreal transit route finder covering Metro, REM, and Exo commuter train networks.
                </p>
              </div>
              <div className="flex gap-8 text-[13px]">
                <div className="space-y-2">
                  <p className="font-medium text-[var(--text-muted)] text-[11px] uppercase tracking-wider">Navigate</p>
                  <Link href="/map" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Network Map</Link>
                  <Link href="/fares" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Fares & Zones</Link>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-[var(--text-muted)] text-[11px] uppercase tracking-wider">Lines</p>
                  <Link href="/line/green" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Green Line</Link>
                  <Link href="/line/orange" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Orange Line</Link>
                  <Link href="/line/blue" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Blue Line</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
