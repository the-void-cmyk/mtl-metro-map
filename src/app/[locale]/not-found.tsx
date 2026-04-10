import Link from "next/link"

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-20 text-center">
      <div className="font-heading text-6xl font-bold tracking-tight text-[var(--text-muted)]">404</div>
      <h1 className="font-heading text-2xl font-bold tracking-tight mt-4">Page not found</h1>
      <p className="text-[var(--text-secondary)] text-[15px] mt-2 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex justify-center gap-3 mt-8">
        <Link
          href="/en"
          className="px-5 py-2.5 bg-[var(--accent)] text-white text-[14px] font-medium rounded-lg hover:bg-[#D96F1A] transition-colors"
        >
          English Home
        </Link>
        <Link
          href="/fr"
          className="px-5 py-2.5 border border-[var(--border)] text-[14px] font-medium rounded-lg hover:border-[#bbb] transition-colors"
        >
          Accueil francais
        </Link>
      </div>
    </div>
  )
}
