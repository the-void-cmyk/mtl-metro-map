import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/lib/i18n'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, static files, and internal Next.js paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    /\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Check if pathname already has a locale prefix
  const hasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (hasLocale) {
    return NextResponse.next()
  }

  // Detect preferred locale from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const prefersFrench = acceptLanguage.toLowerCase().includes('fr')
  const locale = prefersFrench ? 'fr' : defaultLocale

  // Redirect to locale-prefixed URL
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Match all paths except api, _next, static files
    '/((?!api|_next/static|_next/image|favicon|robots.txt|sitemap.xml).*)',
  ],
}
