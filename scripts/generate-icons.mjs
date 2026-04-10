/**
 * Generate PWA PNG icons from SVG sources.
 * Run: node scripts/generate-icons.mjs
 *
 * Requires: macOS with `sips` command available,
 * or install sharp: npm i -D sharp
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

const icons = [
  { src: 'icon-192.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon-512.svg', out: 'icon-512.png', size: 512 },
]

for (const icon of icons) {
  const srcPath = resolve(publicDir, icon.src)
  const outPath = resolve(publicDir, icon.out)

  if (!existsSync(srcPath)) {
    console.error(`Missing source: ${srcPath}`)
    continue
  }

  try {
    // Try sips (macOS built-in)
    execSync(`sips -s format png "${srcPath}" --out "${outPath}" --resampleWidth ${icon.size} --resampleHeight ${icon.size}`, {
      stdio: 'pipe',
    })
    console.log(`Created ${icon.out} (${icon.size}x${icon.size})`)
  } catch {
    console.error(`Failed to convert ${icon.src}. Run on macOS or install sharp.`)
  }
}
