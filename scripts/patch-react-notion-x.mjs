/**
 * Patches react-notion-x's formula evaluator to guard against undefined values
 * in the `replace` and `replaceAll` cases, which causes a crash during SSR
 * when a Notion collection formula returns undefined.
 *
 * Bug: value.replace/replaceAll throws "Cannot read properties of undefined"
 * Fix: use (value ?? "") to fall back to empty string
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(import.meta.url), '..', '..')
const filePath = resolve(
  root,
  'node_modules/react-notion-x/build/third-party/collection.js'
)

let contents
try {
  contents = readFileSync(filePath, 'utf8')
} catch {
  console.warn('[patch] react-notion-x collection.js not found, skipping.')
  process.exit(0)
}

const alreadyPatched =
  contents.includes('(value ?? "").replace(') ||
  contents.includes('(value ?? "").replaceAll(')

if (alreadyPatched) {
  console.log('[patch] react-notion-x already patched, skipping.')
  process.exit(0)
}

const patched = contents
  .replace(
    'return value.replace(new RegExp(regex), replacement);',
    'return (value ?? "").replace(new RegExp(regex), replacement);'
  )
  .replace(
    'return value.replaceAll(new RegExp(regex, "g"), replacement);',
    'return (value ?? "").replaceAll(new RegExp(regex, "g"), replacement);'
  )

if (patched === contents) {
  console.warn(
    '[patch] react-notion-x patch target not found — the bug may already be fixed upstream.'
  )
  process.exit(0)
}

writeFileSync(filePath, patched, 'utf8')
console.log('[patch] react-notion-x patched successfully.')
