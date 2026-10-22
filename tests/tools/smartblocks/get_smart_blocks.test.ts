import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/get_smart_blocks.js'
import { createTestClient, parseResult, jsonResponse } from '../../helpers.js'

const block = (id: number, name: string) => ({
  id, name, description: '', length: null, kind: 'dynamic', owner: 1,
  created_at: '2024-12-02T14:24:12Z', updated_at: '2025-07-19T09:46:20Z',
})
const BLOCKS = [block(1, 'Top 05h'), block(2, 'Rock Classics'), block(3, 'Top 22h')]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get_smart_blocks', () => {
  it('returns all smart blocks when no name is given', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(BLOCKS)))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_smart_blocks', arguments: {} })

    expect(parseResult(result)).toHaveLength(3)
  })

  it('filters by case-insensitive name substring', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(BLOCKS)))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_smart_blocks', arguments: { name: 'TOP' } })
    const blocks = parseResult(result) as ReturnType<typeof block>[]

    expect(blocks.map((b) => b.id)).toEqual([1, 3])
  })
})
