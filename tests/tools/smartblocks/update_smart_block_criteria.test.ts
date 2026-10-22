import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/update_smart_block_criteria.js'
import { createTestClient, parseResult } from '../../helpers.js'
import { sentBodyTo, sentMethods, stubRoutes } from './write.helpers.js'

const crit = (value: string) => ({ id: 7, block: 10, group: 0, criteria: 'genre', condition: 'is', value, extra: null })

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('update_smart_block_criteria', () => {
  it('patches only the provided fields and returns before and after', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-block-criteria/7', body: crit('Rock') },
      { method: 'PATCH', match: '/smart-block-criteria/7', body: crit('Jazz') },
      { method: 'PATCH', match: '/smart-blocks/10', body: {} },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'update_smart_block_criteria', arguments: { criteria_id: 7, value: 'Jazz' } })

    expect(sentBodyTo(spy, 'PATCH', '/smart-block-criteria/7')).toEqual({ value: 'Jazz' })
    expect(sentBodyTo(spy, 'PATCH', '/smart-blocks/10')).toHaveProperty('updated_at')
    expect(parseResult(result)).toMatchObject({ status: 'updated', before: { value: 'Rock' }, after: { value: 'Jazz' } })
  })

  it('refuses to run without any field to update', async () => {
    const spy = stubRoutes([])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'update_smart_block_criteria', arguments: { criteria_id: 7 } })

    expect(parseResult(result)).toMatchObject({ status: 'error' })
    expect(sentMethods(spy)).toEqual([])
  })

  it('still succeeds with a warning when the block date cannot be updated', async () => {
    stubRoutes([
      { method: 'GET', match: '/smart-block-criteria/7', body: crit('Rock') },
      { method: 'PATCH', match: '/smart-block-criteria/7', body: crit('Jazz') },
      { method: 'PATCH', match: '/smart-blocks/10', body: {}, ok: false },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'update_smart_block_criteria', arguments: { criteria_id: 7, value: 'Jazz' } })

    expect(parseResult(result)).toMatchObject({ status: 'updated', warning: expect.stringContaining('saved') })
  })
})
