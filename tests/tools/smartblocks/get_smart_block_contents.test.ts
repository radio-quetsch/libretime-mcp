import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/get_smart_block_contents.js'
import { createTestClient, parseResult, jsonResponse } from '../../helpers.js'

const content = (id: number, block: number) => ({
  id, block, file: id + 100, position: id, offset: 0, length: '00:03:00',
  cue_in: '00:00:00', cue_out: '00:03:00', fade_in: null, fade_out: null,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get_smart_block_contents', () => {
  it('returns only the contents of the requested block', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([content(1, 10), content(2, 11), content(3, 10)])))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_smart_block_contents', arguments: { block_id: 10 } })
    const contents = parseResult(result) as ReturnType<typeof content>[]

    expect(contents.map((c) => c.id)).toEqual([1, 3])
  })
})
