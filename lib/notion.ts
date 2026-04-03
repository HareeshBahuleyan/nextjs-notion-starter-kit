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
import { getPreviewImageMap } from './preview-images'

// Limit concurrent Notion API calls to 3 to stay safely under the 3 req/sec limit
const notionConcurrencyLimit = pLimit(3)

async function getPageWithRetry(
  pageId: string,
  retries = 7,
  delayMs = 2000
): Promise<ExtendedRecordMap> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await notion.getPage(pageId)
    } catch (err: any) {
      const is429or503 =
        err?.status === 429 ||
        err?.status === 503 ||
        err?.statusCode === 429 ||
        err?.statusCode === 503 ||
        String(err?.message).includes('429') ||
        String(err?.message).includes('503')
      if (is429or503 && attempt < retries) {
        const wait = delayMs * 2 ** attempt
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
          concurrency: 4
        }
      )
    }

    return []
  }
)

export async function getPage(pageId: string): Promise<ExtendedRecordMap> {
  let recordMap = await notionConcurrencyLimit(() => getPageWithRetry(pageId))

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
