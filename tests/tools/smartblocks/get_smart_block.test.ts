import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/get_smart_block.js'
import { createTestClient, parseResult, jsonResponse } from '../../helpers.js'

const BLOCK = { id: 10, name: 'Top 05h', description: '', length: null, kind: 'dynamic', owner: 1, created_at: null, updated_at: null }
const CRITERIA = [
  { id: 3, block: 10, group: 1, criteria: 'track_type_id', condition: 'is', value: '1', extra: null },
  { id: 1, block: 10, group: 0, criteria: 'genre', condition: 'is', value: 'Classique', extra: null },
  { id: 2, block: 11, group: 0, criteria: 'genre', condition: 'is', value: 'Jazz', extra: null },
  { id: 4, block: 10, group: 0, criteria: 'limit', condition: 'items', value: '5', extra: null },
]
const CONTENTS = [
  { id: 8, block: 11, file: 900, position: 0, offset: 0 },
  { id: 7, block: 10, file: 901, position: 1, offset: 0 },
  { id: 6, block: 10, file: 902, position: 0, offset: 0 },
]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get_smart_block', () => {
  it('returns the block with its criteria grouped and its contents, for that block only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('/smart-block-criteria')) return Promise.resolve(jsonResponse(CRITERIA))
      if (url.includes('/smart-block-contents')) return Promise.resolve(jsonResponse(CONTENTS))
      return Promise.resolve(jsonResponse(BLOCK))
    }))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_smart_block', arguments: { block_id: 10 } })
    const block = parseResult(result) as Record<string, unknown>

    expect(block.name).toBe('Top 05h')
    expect(block.criteria_groups).toEqual({
      '0': [
        { criteria: 'genre', condition: 'is', value: 'Classique' },
        { criteria: 'limit', condition: 'items', value: '5' },
      ],
      '1': [{ criteria: 'track_type_id', condition: 'is', value: '1' }],
    })
    expect((block.contents as { id: number }[]).map((c) => c.id)).toEqual([6, 7])
  })
})
