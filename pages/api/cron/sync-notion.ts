import type { NextApiRequest, NextApiResponse } from 'next'
import { type Block, type ExtendedRecordMap } from 'notion-types'
import { getAllPagesInSpace, getPageProperty } from 'notion-utils'
import pLimit from 'p-limit'

import type { SiteMap } from '@/lib/types'
import {
  includeNotionIdInUrls,
  isPreviewImageSupportEnabled,
  rootNotionPageId,
  rootNotionSpaceId,
  site
} from '@/lib/config'
import { getCanonicalPageId } from '@/lib/get-canonical-page-id'
import { getTweetsMap } from '@/lib/get-tweets'
import { notion } from '@/lib/notion-api'
import { storePageInBlob, storeSiteMapInBlob } from '@/lib/notion-blob'
import { getPreviewImageMap } from '@/lib/preview-images'

// Allow up to 5 minutes for full sync
export const config = { maxDuration: 300 }

const MIN_DELAY_MS = 500
const limit = pLimit(1)
const uuid = !!includeNotionIdInUrls

async function fetchPageWithRetry(
  pageId: string,
  opts?: any,
  retries = 7,
  baseDelayMs = 5000
): Promise<ExtendedRecordMap> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await notion.getPage(pageId, opts)
      // Minimum delay between requests to stay well under 3 req/sec
      await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS))
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
          `[sync-notion] rate limit for page ${pageId}, retrying in ${wait}ms (attempt ${attempt + 1}/${retries})`
        )
        await new Promise((resolve) => setTimeout(resolve, wait))
      } else {
        throw err
      }
    }
  }
  throw new Error(`Failed to fetch page ${pageId} after ${retries} retries`)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Fail closed: require CRON_SECRET in all environments except local dev
  const cronSecret = process.env.CRON_SECRET
  const isDev = process.env.NODE_ENV === 'development'
  if (!cronSecret && !isDev) {
    return res.status(500).json({ error: 'CRON_SECRET env var is not set' })
  }
  if (cronSecret) {
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const syncedPageIds: string[] = []
  const failedPageIds: string[] = []
  const failedPageErrors: Array<{ pageId: string; error: string }> = []

  try {
    // Fetch fresh site map directly (not memoized)
    const pageMap = await getAllPagesInSpace(
      rootNotionPageId,
      rootNotionSpaceId ?? undefined,
      (pageId: string, opts?: any) =>
        limit(() => fetchPageWithRetry(pageId, opts)),
      { concurrency: 1, maxDepth: 1 }
    )

    // Build a real canonicalPageMap — same logic as lib/get-site-map.ts
    const canonicalPageMap = Object.keys(pageMap).reduce(
      (map: Record<string, string>, pageId: string) => {
        const recordMap = pageMap[pageId]
        if (!recordMap) return map

        const block = recordMap.block[pageId]?.value as Block | undefined
        if (
          !(getPageProperty<boolean | null>('Public', block!, recordMap) ?? true)
        ) {
          return map
        }

        const canonicalPageId = getCanonicalPageId(pageId, recordMap, { uuid })
        if (!canonicalPageId || map[canonicalPageId]) return map

        return { ...map, [canonicalPageId]: pageId }
      },
      {}
    )

    const siteMap: SiteMap = {
      site,
      pageMap,
      canonicalPageMap
    }

    await storeSiteMapInBlob(siteMap)

    // Enrich and store each page — reuse recordMaps already fetched by getAllPagesInSpace
    for (const pageId of Object.keys(pageMap)) {
      try {
        const recordMap = pageMap[pageId]
        if (!recordMap) {
          failedPageIds.push(pageId)
          failedPageErrors.push({ pageId, error: 'recordMap is null' })
          continue
        }

        if (isPreviewImageSupportEnabled) {
          const previewImageMap = await getPreviewImageMap(recordMap)
          ;(recordMap as any).preview_images = previewImageMap
        }

        await getTweetsMap(recordMap)
        await storePageInBlob(pageId, recordMap)
        syncedPageIds.push(pageId)
      } catch (err: any) {
        console.error(`[sync-notion] failed to sync page ${pageId}:`, err?.message)
        failedPageIds.push(pageId)
        failedPageErrors.push({ pageId, error: err?.message ?? String(err) })
      }
    }

    return res.status(200).json({
      ok: true,
      synced: syncedPageIds.length,
      failed: failedPageIds.length,
      failedPageIds,
      failedPageErrors
    })
  } catch (err: any) {
    console.error('[sync-notion] fatal error:', err?.message)
    return res.status(500).json({ error: err?.message ?? 'Unknown error' })
  }
}
