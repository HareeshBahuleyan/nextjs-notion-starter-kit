import { type NextApiRequest, type NextApiResponse } from 'next'
import { getBlockValue } from 'notion-utils'

import type * as types from '../../lib/types'
import { search } from '../../lib/notion'

export default async function searchNotion(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const searchParams: types.SearchParams = req.body

  console.log('<<< lambda search-notion', searchParams)
  const results = await search(searchParams)
  console.log('>>> lambda search-notion', results)

  // The Notion API v3 search response returns blocks in a nested format:
  //   { role, value: { role, value: Block } }
  // react-notion-x accesses `.value` directly and expects the flat format:
  //   { role, value: Block }
  // If the block is doubly-nested, getBlockTitle() finds no `.properties`
  // and silently drops every result, showing "No results" in the UI.
  // Normalize each block entry so react-notion-x can read titles correctly.
  if (results.recordMap?.block) {
    for (const [id, blockBox] of Object.entries(results.recordMap.block)) {
      const unwrapped = getBlockValue(blockBox as any)
      if (unwrapped) {
        ;(results.recordMap.block as any)[id] = {
          role: (blockBox as any).role ?? 'reader',
          value: unwrapped
        }
      }
    }
  }

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, max-age=60, stale-while-revalidate=60'
  )
  res.status(200).json(results)
}
