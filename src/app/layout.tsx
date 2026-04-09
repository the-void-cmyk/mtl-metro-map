import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
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
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "MTL Metro",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      en: "/en",
      fr: "/fr",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${spaceGrotesk.variable} ${dmSans.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "MTL Metro",
              url: "https://mtlmetromap.com",
              description:
                "Montreal Metro route finder. Plan your trip across Metro, REM, and Exo commuter trains.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://mtlmetromap.com/en/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
