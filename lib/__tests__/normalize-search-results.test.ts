import { describe, expect, it } from 'vitest'

import { normalizeSearchResults } from '../normalize-search-results'

// Minimal block shape for testing — cast to any to avoid satisfying
// the full Block union type from notion-types.
const mockBlock = {
  id: 'block-abc',
  type: 'page',
  properties: { title: [['Test Page']] },
  parent_id: 'parent-abc',
  parent_table: 'space'
} as any

describe('normalizeSearchResults', () => {
  it('leaves already-flat blocks ({ role, value: Block }) unchanged', () => {
    const input = {
      results: [],
      total: 0,
      recordMap: {
        block: { 'block-abc': { role: 'reader', value: mockBlock } }
      }
    } as any

    const output = normalizeSearchResults(input)
    const entry = output.recordMap.block['block-abc'] as any

    expect(entry.value).toEqual(mockBlock)
    expect(entry.role).toBe('reader')
  })

  it('unwraps doubly-nested blocks (Notion API v3 format)', () => {
    const input = {
      results: [],
      total: 0,
      recordMap: {
        block: {
          'block-abc': {
            role: 'reader',
            value: { role: 'reader', value: mockBlock }
          }
        }
      }
    } as any

    const output = normalizeSearchResults(input)
    const entry = output.recordMap.block['block-abc'] as any

    expect(entry.value).toEqual(mockBlock)
    expect(entry.role).toBe('reader')
  })

  it('makes block.properties.title accessible after unwrapping', () => {
    const input = {
      results: [],
      total: 0,
      recordMap: {
        block: {
          'block-abc': {
            role: 'reader',
            value: { role: 'reader', value: mockBlock }
          }
        }
      }
    } as any

    const output = normalizeSearchResults(input)
    const block = (output.recordMap.block['block-abc'] as any).value as any

    expect(block.properties?.title).toEqual([['Test Page']])
  })

  it('normalizes multiple blocks in a single response', () => {
    const blockA = { ...mockBlock, id: 'block-a' }
    const blockB = { ...mockBlock, id: 'block-b', properties: { title: [['Page B']] } }

    const input = {
      results: [],
      total: 0,
      recordMap: {
        block: {
          'block-a': { role: 'reader', value: { role: 'reader', value: blockA } },
          'block-b': { role: 'reader', value: { role: 'reader', value: blockB } }
        }
      }
    } as any

    const output = normalizeSearchResults(input)

    expect(((output.recordMap.block['block-a'] as any).value as any).id).toBe('block-a')
    expect(
      ((output.recordMap.block['block-b'] as any).value as any).properties
    ).toEqual({ title: [['Page B']] })
  })

  it('handles empty block map without throwing', () => {
    const input = { results: [], total: 0, recordMap: { block: {} } } as any
    expect(() => normalizeSearchResults(input)).not.toThrow()
  })

  it('returns results unchanged when recordMap is absent', () => {
    const input = { results: [], total: 0 } as any
    expect(normalizeSearchResults(input)).toBe(input)
  })
})
