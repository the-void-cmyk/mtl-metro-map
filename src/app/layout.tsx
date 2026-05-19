import type { Metadata } from "next"
import Script from "next/script"
import { GoogleAnalytics } from "@next/third-parties/google"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://mtlmetromap.com"),
  title: {
    default: "Montreal Metro Map: Routes, Stations & Fares | STM, REM, Exo",
    template: "%s | MTL Metro",
  },
  description:
    "Plan the fastest route across Montreal's transit network. 138 stations covering the STM Metro, REM light rail, and Exo commuter trains, with fares, schedules, and step-by-step directions.",
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
    <html className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-full flex flex-col antialiased overflow-x-hidden">
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);else if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`}
        </Script>
        <Script id="json-ld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MTL Metro",
            url: "https://mtlmetromap.com",
            description: "Montreal Metro route finder. Plan your trip across Metro, REM, and Exo commuter trains.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://mtlmetromap.com/en/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          })}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator && window.location.hostname !== 'localhost'){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}`}
        </Script>
        {children}
        <GoogleAnalytics gaId="G-YJMD4ND0V5" />
      </body>
    </html>
  )
}
