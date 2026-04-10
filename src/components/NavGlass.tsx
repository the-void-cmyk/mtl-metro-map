"use client"

// CSS-based frosted glass for the navbar.
// WebGL refraction doesn't work well on thin horizontal bars
// because the texture UV mapping gets distorted. Apple's actual
// liquid glass UI uses backdrop-filter for bars and toolbars.

export default function NavGlass() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: -1,
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        background: "rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.1)",
      }}
    />
  )
}
