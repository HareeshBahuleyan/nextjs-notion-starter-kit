import { type Block } from 'notion-types'
import { getAllPagesInSpace, getPageProperty, uuidToId } from 'notion-utils'
import pLimit from 'p-limit'
import pMemoize from 'p-memoize'

import type * as types from './types'
import * as config from './config'
import { includeNotionIdInUrls } from './config'
import { getCanonicalPageId } from './get-canonical-page-id'
import { notion } from './notion-api'
import { getSiteMapFromBlob } from './notion-blob'

const uuid = !!includeNotionIdInUrls

export async function getSiteMap(): Promise<types.SiteMap> {
  // Check Blob cache first (populated daily by cron job)
  const cached = await getSiteMapFromBlob()
  if (cached) {
    return cached
  }

  // Fall back to fetching from Notion
  const partialSiteMap = await getAllPages(
    config.rootNotionPageId,
    config.rootNotionSpaceId ?? undefined
  )

  return {
    site: config.site,
    ...partialSiteMap
  } as types.SiteMap
}

const getAllPages = pMemoize(getAllPagesImpl, {
  cacheKey: (...args) => JSON.stringify(args)
})

const siteMapConcurrencyLimit = pLimit(1)
const SITEMAP_MIN_REQUEST_DELAY_MS = 500

async function getPageWithRetry(
  pageId: string,
  opts?: any,
  retries = 7,
  baseDelayMs = 5000
): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await notion.getPage(pageId, opts)
      // Minimum delay between requests to stay well under 3 req/sec
      await new Promise((resolve) =>
        setTimeout(resolve, SITEMAP_MIN_REQUEST_DELAY_MS)
      )
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
        const wait =
          baseDelayMs + Math.floor(Math.random() * (cap - baseDelayMs))
        console.warn(
          `Notion rate limit (sitemap) for page ${pageId}, retrying in ${wait}ms (attempt ${attempt + 1}/${retries})`
        )
        await new Promise((resolve) => setTimeout(resolve, wait))
      } else {
        throw err
      }
    }
  }
}

const getPage = async (pageId: string, opts?: any) => {
  console.log('\nnotion getPage', uuidToId(pageId))
  return siteMapConcurrencyLimit(() => getPageWithRetry(pageId, opts))
}

async function getAllPagesImpl(
  rootNotionPageId: string,
  rootNotionSpaceId?: string,
  {
    maxDepth = 1
  }: {
    maxDepth?: number
  } = {}
): Promise<Partial<types.SiteMap>> {
  const pageMap = await getAllPagesInSpace(
    rootNotionPageId,
    rootNotionSpaceId,
    getPage,
    {
      concurrency: 1,
      maxDepth
    }
  )

  const canonicalPageMap = Object.keys(pageMap).reduce(
    (map: Record<string, string>, pageId: string) => {
      const recordMap = pageMap[pageId]
      if (!recordMap) {
        throw new Error(`Error loading page "${pageId}"`)
      }

      const block = recordMap.block[pageId]?.value as Block | undefined
      if (
        !(getPageProperty<boolean | null>('Public', block!, recordMap) ?? true)
      ) {
        return map
      }

      const canonicalPageId = getCanonicalPageId(pageId, recordMap, {
        uuid
      })!

      if (map[canonicalPageId]) {
        // you can have multiple pages in different collections that have the same id
        // TODO: we may want to error if neither entry is a collection page
        console.warn('error duplicate canonical page id', {
          canonicalPageId,
          pageId,
          existingPageId: map[canonicalPageId]
        })

        return map
      } else {
        return {
          ...map,
          [canonicalPageId]: pageId
        }
      }
    },
    {}
  )

  return {
    pageMap,
    canonicalPageMap
  }
}
