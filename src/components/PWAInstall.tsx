'use client'

import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'mtl-metro-pwa-dismissed'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return

    // Only show on mobile/tablet (viewport <= 1024px)
    if (window.innerWidth > 1024) return

    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setDeferredPrompt(null)
    localStorage.setItem(DISMISS_KEY, '1')
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div
        className="mx-auto max-w-lg rounded-t-2xl rounded-b-lg px-5 py-4 flex items-center gap-4"
        style={{
          background: 'var(--hero-bg)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* App icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255, 255, 255, 0.12)' }}
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <text
              x="16"
              y="24"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="700"
              fontSize="22"
              fill="white"
            >
              M
            </text>
          </svg>
        </div>

        {/* Text */}
        <p className="flex-1 text-[13px] sm:text-sm text-white/90 leading-snug">
          Add MTL Metro to your home screen for quick access
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
