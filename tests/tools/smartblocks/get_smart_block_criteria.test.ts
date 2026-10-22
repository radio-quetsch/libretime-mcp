import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/get_smart_block_criteria.js'
import { createTestClient, parseResult, jsonResponse } from '../../helpers.js'

const criterion = (id: number, block: number) => ({
  id, block, group: 0, criteria: 'genre', condition: 'is', value: 'Rock', extra: null,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get_smart_block_criteria', () => {
  it('returns only the criteria of the requested block', async () => {
    // The API ignores the ?block= param and returns every block's criteria
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([criterion(1, 10), criterion(2, 11), criterion(3, 10)])))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_smart_block_criteria', arguments: { block_id: 10 } })
    const criteria = parseResult(result) as ReturnType<typeof criterion>[]

    expect(criteria.map((c) => c.id)).toEqual([1, 3])
  })
})
