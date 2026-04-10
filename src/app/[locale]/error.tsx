"use client"

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-5 py-20 text-center">
      <div className="font-heading text-5xl font-bold tracking-tight text-[var(--text-muted)]">Oops</div>
      <h1 className="font-heading text-2xl font-bold tracking-tight mt-4">Something went wrong</h1>
      <p className="text-[var(--text-secondary)] text-[15px] mt-2 max-w-md mx-auto">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-8 px-5 py-2.5 bg-[var(--accent)] text-white text-[14px] font-medium rounded-lg hover:bg-[#0055AA] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
