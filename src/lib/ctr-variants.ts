import type { CTRVariant } from './types'

/**
 * Deterministically assigns a CTR variant (A, B, C, D) to a route.
 * Uses a simple hash of the route pair so:
 * - Same route always gets same variant (stable for Google indexing)
 * - Variants are evenly distributed across all routes
 * - Easy to change the distribution by modifying this function
 */
export function getCTRVariant(fromSlug: string, toSlug: string): CTRVariant {
  const key = `${fromSlug}:${toSlug}`
  const hash = simpleHash(key)
  const variants: CTRVariant[] = ['A', 'B', 'C', 'D']
  return variants[hash % variants.length]
}

/**
 * Simple string hash function (djb2)
 * Deterministic, fast, good distribution
 */
function simpleHash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

/**
 * Override variant for a batch of routes (e.g., after a test concludes).
 * In production, you'd store this in the DB or config.
 * For now, this lets you force a winning variant.
 */
export function getVariantOverride(): CTRVariant | null {
  // Set this to a winning variant after A/B test concludes
  // e.g., return 'A' to use Pattern A for all routes
  return null
}
