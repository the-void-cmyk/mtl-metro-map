import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MTL Metro - Montreal Metro Route Finder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const fr = locale === 'fr'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#f5f4ed',
          color: '#0a0a0a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '24px 48px',
            borderBottom: '4px solid #0a0a0a',
            fontSize: 18,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          <span>{'// MTL_METRO_MAP'}</span>
          <span>138 STATIONS / 3 NETWORKS</span>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            padding: '64px 48px',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 720 }}>
            <div
              style={{
                fontSize: 18,
                letterSpacing: 4,
                textTransform: 'uppercase',
                marginBottom: 24,
                color: '#666',
              }}
            >
              {fr ? '// PLANIFICATEUR' : '// ROUTE_PLANNER'}
            </div>
            <div
              style={{
                fontSize: 96,
                lineHeight: 0.95,
                fontWeight: 700,
                letterSpacing: -2,
                marginBottom: 24,
              }}
            >
              {fr ? 'Métro Montréal' : 'Montreal Metro'}
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.3, maxWidth: 640 }}>
              {fr
                ? 'STM, REM et Exo. Trajets, tarifs et horaires.'
                : 'STM, REM, and Exo. Routes, fares, and schedules.'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              alignItems: 'flex-end',
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0078c9' }} />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f58220' }} />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00a651' }} />
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ffd200' }} />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '20px 48px',
            borderTop: '4px solid #0a0a0a',
            fontSize: 16,
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <span>mtlmetromap.com</span>
          <span>v3.0</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
