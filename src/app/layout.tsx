import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} h-full`}>
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
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                M
              </span>
              <span>MTL Metro</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/map" className="text-gray-600 hover:text-gray-900">
                Map
              </Link>
              <Link href="/fares" className="text-gray-600 hover:text-gray-900">
                Fares
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-sm text-gray-500">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="font-medium text-gray-700">MTL Metro</p>
                <p className="mt-1">
                  Montreal transit route finder for Metro, REM, and Exo.
                </p>
              </div>
              <div className="flex gap-6">
                <Link href="/map" className="hover:text-gray-700">
                  Network Map
                </Link>
                <Link href="/fares" className="hover:text-gray-700">
                  Fares
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
