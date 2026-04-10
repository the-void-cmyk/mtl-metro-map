import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MTL Metro - Montreal Metro Route Finder',
    short_name: 'MTL Metro',
    description: 'Find the fastest route across Montreal\'s Metro, REM, and Exo commuter train network.',
    start_url: '/en',
    id: '/en',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F7F5',
    theme_color: '#0C1220',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
