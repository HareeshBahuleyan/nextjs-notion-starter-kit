import type { NextApiRequest, NextApiResponse } from 'next'
import { type ExtendedRecordMap } from 'notion-types'
import { getAllPagesInSpace } from 'notion-utils'
import pLimit from 'p-limit'

import type { SiteMap } from '@/lib/types'
import {
  isPreviewImageSupportEnabled,
  rootNotionPageId,
  rootNotionSpaceId,
  site
} from '@/lib/config'
import { getTweetsMap } from '@/lib/get-tweets'
import { notion } from '@/lib/notion-api'
import { storePageInBlob, storeSiteMapInBlob } from '@/lib/notion-blob'
import { getPreviewImageMap } from '@/lib/preview-images'

// Allow up to 5 minutes for full sync
export const config = { maxDuration: 300 }

const MIN_DELAY_MS = 500
const limit = pLimit(1)

async function fetchPageWithDelay(
  pageId: string,
  opts?: any
): Promise<ExtendedRecordMap> {
  const result = await notion.getPage(pageId, opts)
  await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS))
  return result
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cronSecret = process.env.CRON_SECRET
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
        limit(() => fetchPageWithDelay(pageId, opts)),
      { concurrency: 1, maxDepth: 1 }
    )

    const siteMap: SiteMap = {
      site,
      pageMap,
      canonicalPageMap: {}
    }

    await storeSiteMapInBlob(siteMap)

    // Enrich and store each page
    for (const pageId of Object.keys(pageMap)) {
      try {
        const recordMap = await limit(() => fetchPageWithDelay(pageId))

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
      failedPageIds: failedPageErrors
    })
  } catch (err: any) {
    console.error('[sync-notion] fatal error:', err?.message)
    return res.status(500).json({ error: err?.message ?? 'Unknown error' })
  }
}
