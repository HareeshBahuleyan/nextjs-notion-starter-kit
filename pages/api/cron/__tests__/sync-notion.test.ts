import { getAllPagesInSpace } from 'notion-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { storePageInBlob, storeSiteMapInBlob } from '@/lib/notion-blob'

import handler from '../sync-notion'

vi.mock('notion-utils', () => ({
  getAllPagesInSpace: vi.fn(),
  getPageProperty: vi.fn(() => true)
}))

vi.mock('@/lib/config', () => ({
  includeNotionIdInUrls: false,
  isPreviewImageSupportEnabled: false,
  rootNotionPageId: 'root-page',
  rootNotionSpaceId: null,
  site: {}
}))

vi.mock('@/lib/get-canonical-page-id', () => ({
  getCanonicalPageId: vi.fn((pageId: string) => pageId)
}))

vi.mock('@/lib/get-tweets', () => ({
  getTweetsMap: vi.fn(async () => ({}))
}))

vi.mock('@/lib/notion-api', () => ({
  notion: {
    getPage: vi.fn()
  }
}))

vi.mock('@/lib/notion-blob', () => ({
  isBlobStoreLimitError: vi.fn(
    (err: unknown) => err instanceof Error && err.name === 'BlobStoreLimitError'
  ),
  storePageInBlob: vi.fn(),
  storeSiteMapInBlob: vi.fn()
}))

vi.mock('@/lib/preview-images', () => ({
  getPreviewImageMap: vi.fn(async () => ({}))
}))

function makeRecordMap(pageId: string) {
  return {
    block: {
      [pageId]: {
        value: {}
      }
    }
  } as any
}

function createRes() {
  return {
    statusCode: 200,
    body: undefined as any,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(body: any) {
      this.body = body
      return this
    }
  }
}

function createBlobStoreLimitError(message = 'This store has been suspended.') {
  const err = new Error(message)
  err.name = 'BlobStoreLimitError'
  return err
}

describe('sync-notion cron handler', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret'

    vi.mocked(getAllPagesInSpace).mockResolvedValue({
      'page-1': makeRecordMap('page-1'),
      'page-2': makeRecordMap('page-2')
    })
  })

  afterEach(() => {
    delete process.env.CRON_SECRET
    vi.clearAllMocks()
  })

  it('returns success and skips page writes when the site map blob write hits the limit', async () => {
    vi.mocked(storeSiteMapInBlob).mockRejectedValueOnce(
      createBlobStoreLimitError()
    )

    const res = createRes()

    await handler(
      {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' }
      } as any,
      res as any
    )

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      ok: true,
      skipped: true,
      blobLimitReached: true,
      skippedPageCount: 2,
      synced: 0,
      failed: 0
    })
    expect(storePageInBlob).not.toHaveBeenCalled()
  })

  it('stops the cron run after the first blob-limit page write failure', async () => {
    vi.mocked(storeSiteMapInBlob).mockResolvedValueOnce(undefined)
    vi.mocked(storePageInBlob).mockRejectedValueOnce(
      createBlobStoreLimitError()
    )

    const res = createRes()

    await handler(
      {
        method: 'GET',
        headers: { authorization: 'Bearer test-secret' }
      } as any,
      res as any
    )

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      ok: true,
      skipped: true,
      blobLimitReached: true,
      skippedPageCount: 1,
      synced: 0,
      failed: 0
    })
    expect(storePageInBlob).toHaveBeenCalledTimes(1)
  })
})
