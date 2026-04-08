import {
  type ExtendedRecordMap,
  type SearchParams,
  type SearchResults
} from 'notion-types'
import { mergeRecordMaps } from 'notion-utils'
import pLimit from 'p-limit'
import pMap from 'p-map'
import pMemoize from 'p-memoize'

import {
  isPreviewImageSupportEnabled,
  navigationLinks,
  navigationStyle
} from './config'
import { getTweetsMap } from './get-tweets'
import { notion } from './notion-api'
import { getPageFromBlob } from './notion-blob'
import { getPreviewImageMap } from './preview-images'

// Single concurrent Notion API call at a time + 500ms min gap = max ~2 pages/sec
const notionConcurrencyLimit = pLimit(1)
const MIN_REQUEST_DELAY_MS = 500

async function getPageWithRetry(
  pageId: string,
  retries = 7,
  baseDelayMs = 5000
): Promise<ExtendedRecordMap> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await notion.getPage(pageId)
      // Minimum delay between requests to stay well under 3 req/sec
      await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_DELAY_MS))
      return result
    } catch (err: any) {
      const is429or503 =
        err?.status === 429 ||
        err?.status === 503 ||
        err?.statusCode === 429 ||
        err?.statusCode === 503 ||
        String(err?.message).includes('429') ||
        String(err?.message).includes('503')
      if (is429or503 && attempt < retries) {
        // Full jitter: random in [baseDelay, baseDelay * 2^attempt] to avoid thundering herd
        const cap = baseDelayMs * 2 ** attempt
        const wait = baseDelayMs + Math.floor(Math.random() * (cap - baseDelayMs))
        console.warn(
          `Notion rate limit hit for page ${pageId}, retrying in ${wait}ms (attempt ${attempt + 1}/${retries})`
        )
        await new Promise((resolve) => setTimeout(resolve, wait))
      } else {
        throw err
      }
    }
  }
  // unreachable, but satisfies TypeScript
  throw new Error(`Failed to fetch page ${pageId} after ${retries} retries`)
}

const getNavigationLinkPages = pMemoize(
  async (): Promise<ExtendedRecordMap[]> => {
    const navigationLinkPageIds = (navigationLinks || [])
      .map((link) => link?.pageId)
      .filter(Boolean)

    if (navigationStyle !== 'default' && navigationLinkPageIds.length) {
      return pMap(
        navigationLinkPageIds,
        async (navigationLinkPageId) =>
          notionConcurrencyLimit(() =>
            notion.getPage(navigationLinkPageId, {
              chunkLimit: 1,
              fetchMissingBlocks: false,
              fetchCollections: false,
              signFileUrls: false
            })
          ),
        {
          concurrency: 1
        }
      )
    }

    return []
  }
)

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  // Check Blob cache first (populated daily by cron job)
  const cached = await getPageFromBlob(pageId)

  // Fall back to live Notion API if not cached
  let recordMap =
    cached ?? (await notionConcurrencyLimit(() => getPageWithRetry(pageId)))

  if (navigationStyle !== 'default') {
    // ensure that any pages linked to in the custom navigation header have
    // their block info fully resolved in the page record map so we know
    // the page title, slug, etc.
    const navigationLinkRecordMaps = await getNavigationLinkPages()

    if (navigationLinkRecordMaps?.length) {
      recordMap = navigationLinkRecordMaps.reduce(
        (map, navigationLinkRecordMap) =>
          mergeRecordMaps(map, navigationLinkRecordMap),
        recordMap
      )
    }
  }

  if (isPreviewImageSupportEnabled) {
    const previewImageMap = await getPreviewImageMap(recordMap)
    ;(recordMap as any).preview_images = previewImageMap
  }

  await getTweetsMap(recordMap)

  return recordMap
}

export async function search(params: SearchParams): Promise<SearchResults> {
  return notion.search(params)
}
