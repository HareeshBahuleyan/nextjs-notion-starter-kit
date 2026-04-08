import type { SearchResults } from 'notion-types'
import { getBlockValue } from 'notion-utils'

/**
 * Normalizes the recordMap.block entries in a Notion search response.
 *
 * The Notion API v3 search endpoint may return blocks in a doubly-nested format:
 *   { role, value: { role, value: Block } }
 *
 * react-notion-x accesses `.value` directly and expects the flat format:
 *   { role, value: Block }
 *
 * When doubly-nested, getBlockTitle() finds no `.properties` and returns "",
 * causing every result to be silently filtered out (showing "No results" in the UI).
 *
 * This function unwraps any level of nesting to the expected flat format.
 */
export function normalizeSearchResults(results: SearchResults): SearchResults {
  if (!results.recordMap?.block) return results

  for (const [id, blockBox] of Object.entries(results.recordMap.block)) {
    const unwrapped = getBlockValue(blockBox as any)
    if (unwrapped) {
      ;(results.recordMap.block as any)[id] = {
        role: (blockBox as any).role ?? 'reader',
        value: unwrapped
      }
    }
  }

  return results
}
