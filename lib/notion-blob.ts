import type { ExtendedRecordMap } from 'notion-types'
import { list, put } from '@vercel/blob'

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
    const { blobs } = await list({ prefix: key })
    const blob = blobs.find((b) => b.pathname === key)
    if (!blob) return null
    const res = await fetch(blob.url)
    if (!res.ok) return null
    return res.json() as Promise<T>
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
      access: 'public',
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
