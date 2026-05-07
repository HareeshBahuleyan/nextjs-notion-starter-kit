import { BlobStoreSuspendedError, get, put } from '@vercel/blob'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  BlobStoreLimitError,
  getPageFromBlob,
  isBlobStoreLimitError,
  storePageInBlob
} from '../notion-blob'

vi.mock('@vercel/blob', () => {
  class BlobStoreSuspendedError extends Error {
    constructor() {
      super('This store has been suspended.')
      this.name = 'BlobStoreSuspendedError'
    }
  }

  return {
    BlobStoreSuspendedError,
    get: vi.fn(),
    put: vi.fn()
  }
})

describe('notion-blob', () => {
  beforeEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
  })

  afterEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    vi.clearAllMocks()
  })

  it('detects Blob store suspension errors', () => {
    expect(isBlobStoreLimitError(new BlobStoreSuspendedError())).toBe(true)
    expect(
      isBlobStoreLimitError(new Error('Advanced operation quota exceeded'))
    ).toBe(true)
  })

  it('rethrows blob-limit write failures as BlobStoreLimitError', async () => {
    vi.mocked(put).mockRejectedValueOnce(new BlobStoreSuspendedError())

    await expect(storePageInBlob('page-1', {} as any)).rejects.toBeInstanceOf(
      BlobStoreLimitError
    )
  })

  it('returns null when blob reads hit the store limit', async () => {
    vi.mocked(get).mockRejectedValueOnce(new BlobStoreSuspendedError())

    await expect(getPageFromBlob('page-1')).resolves.toBeNull()
  })
})
