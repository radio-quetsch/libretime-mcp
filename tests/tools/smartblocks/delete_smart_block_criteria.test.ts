import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/delete_smart_block_criteria.js'
import { createTestClient, parseResult } from '../../helpers.js'
import { sentMethods, stubRoutes } from './write.helpers.js'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('delete_smart_block_criteria', () => {
  it('deletes the criterion and returns it', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-block-criteria/7', body: { id: 7, block: 10, group: 0, criteria: 'genre', condition: 'is', value: 'Rock', extra: null } },
      { method: 'DELETE', match: '/smart-block-criteria/7', body: {} },
      { method: 'PATCH', match: '/smart-blocks/10', body: {} },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'delete_smart_block_criteria', arguments: { criteria_id: 7 } })

    expect(sentMethods(spy)).toEqual(['GET', 'DELETE', 'PATCH'])
    expect(parseResult(result)).toMatchObject({ status: 'deleted', criteria: { id: 7, value: 'Rock' } })
  })

  it('still succeeds with a warning when the block date cannot be updated', async () => {
    stubRoutes([
      { method: 'GET', match: '/smart-block-criteria/7', body: { id: 7, block: 10, group: 0, criteria: 'genre', condition: 'is', value: 'Rock', extra: null } },
      { method: 'DELETE', match: '/smart-block-criteria/7', body: {} },
      { method: 'PATCH', match: '/smart-blocks/10', body: {}, ok: false },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'delete_smart_block_criteria', arguments: { criteria_id: 7 } })

    expect(parseResult(result)).toMatchObject({ status: 'deleted', warning: expect.stringContaining('saved') })
  })
})
