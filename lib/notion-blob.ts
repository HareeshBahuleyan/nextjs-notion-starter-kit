import type { ExtendedRecordMap } from 'notion-types'
import { get, put } from '@vercel/blob'

import type { SiteMap } from './types'

const BLOB_PREFIX = 'notion-cache'

function pageKey(pageId: string) {
  return `${BLOB_PREFIX}/page-${pageId}.json`
}

const SITE_MAP_KEY = `${BLOB_PREFIX}/site-map.json`

async function readBlob<T>(key: string): Promise<T | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null
  }
  try {
    // Use get() with a single authenticated request — no list() round-trip
    const result = await get(key, { access: 'private' })
    if (!result) return null
    const text = await new Response(result.stream).text()
    return JSON.parse(text) as T
  } catch (err: any) {
    console.warn(`[notion-blob] read error for "${key}":`, err?.message)
    return null
  }
}

async function writeBlob(key: string, data: unknown): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return
  }
  try {
    const body = JSON.stringify(data)
    await put(key, body, {
      access: 'private',
      contentType: 'application/json',
      allowOverwrite: true
    })
  } catch (err: any) {
    console.warn(`[notion-blob] write error for "${key}":`, err?.message)
  }
}

export async function getPageFromBlob(
  pageId: string
): Promise<ExtendedRecordMap | null> {
  return readBlob<ExtendedRecordMap>(pageKey(pageId))
}

export async function storePageInBlob(
  pageId: string,
  recordMap: ExtendedRecordMap
): Promise<void> {
  return writeBlob(pageKey(pageId), recordMap)
}

export async function getSiteMapFromBlob(): Promise<SiteMap | null> {
  return readBlob<SiteMap>(SITE_MAP_KEY)
}

export async function storeSiteMapInBlob(siteMap: SiteMap): Promise<void> {
  return writeBlob(SITE_MAP_KEY, siteMap)
}
