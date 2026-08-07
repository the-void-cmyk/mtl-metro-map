"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import type { ComponentProps } from "react"

type HoverPrefetchLinkProps = ComponentProps<typeof Link>

/**
 * A Link that waits for intent before prefetching.
 *
 * Next prefetches every Link the moment it enters the viewport, which turned a
 * single homepage view into ~70 RSC requests (each nav link was being fetched
 * 3-7 times). Here prefetch stays off and we warm the route by hand on hover or
 * focus, so only links the visitor looks likely to click cost a request.
 *
 * We call router.prefetch rather than flipping the prefetch prop from false to
 * null: on Next 16.2.2 that flip does nothing for a link already in the
 * viewport, because its intersection observer has already fired. Manual
 * prefetch is the documented escape hatch, see the "Manual prefetch" section of
 * node_modules/next/dist/docs/01-app/02-guides/prefetching.md
 *
 * Touch devices have no hover, so mobile visitors get a normal server
 * navigation instead of an instant client transition.
 */
export default function HoverPrefetchLink({ children, href, ...props }: HoverPrefetchLinkProps) {
  const router = useRouter()
  const warmed = useRef(false)

  const warm = () => {
    if (warmed.current || typeof href !== "string") return
    warmed.current = true
    router.prefetch(href)
  }

  return (
    <Link {...props} href={href} prefetch={false} onMouseEnter={warm} onFocus={warm}>
      {children}
    </Link>
  )
}
