import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/add_smart_block_criteria.js'
import { createTestClient, parseResult } from '../../helpers.js'
import { countRequests, sentBodyTo, sentMethods, stubRoutes } from './write.helpers.js'

const crit = (id: number, block: number, criteria: string, value: string, group: number | null) =>
  ({ id, block, group, criteria, condition: 'is', value, extra: null })

const ARGS = { criteria: 'track_type_id', condition: 'is', value: '1', group: 1 }
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/

type Result = { block_id: number; status: string; warning?: string }
const results = (r: unknown) => (parseResult(r as never) as { results: Result[] }).results

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('add_smart_block_criteria', () => {
  it('posts a new criterion with its group and bumps the block date', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-block-criteria', body: [crit(1, 10, 'genre', 'Rock', 0)] },
      { method: 'POST', match: '/smart-block-criteria', body: crit(2, 10, 'track_type_id', '1', 1) },
      { method: 'PATCH', match: '/smart-blocks/10', body: {} },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'add_smart_block_criteria', arguments: { block_ids: [10], ...ARGS } })

    expect(results(result)).toMatchObject([{ block_id: 10, status: 'added' }])
    expect(sentBodyTo(spy, 'POST', '/smart-block-criteria')).toEqual({ block: 10, ...ARGS, extra: null })
    expect(sentBodyTo(spy, 'PATCH', '/smart-blocks/10')).toEqual({ updated_at: expect.stringMatching(ISO) })
  })

  it('leaves a block unchanged when an identical criterion already exists', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-block-criteria', body: [crit(5, 10, 'track_type_id', '1', 1), crit(6, 11, 'genre', 'Rock', 0)] },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'add_smart_block_criteria', arguments: { block_ids: [10], ...ARGS } })

    expect(results(result)).toMatchObject([{ block_id: 10, status: 'unchanged' }])
    expect(sentMethods(spy)).toEqual(['GET'])
  })

  it('ignores an identical criterion that belongs to another block', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-block-criteria', body: [crit(5, 11, 'track_type_id', '1', 1)] },
      { method: 'POST', match: '/smart-block-criteria', body: crit(6, 10, 'track_type_id', '1', 1) },
      { method: 'PATCH', match: '/smart-blocks/10', body: {} },
    ])
    const client = await createTestClient(register)

    await client.callTool({ name: 'add_smart_block_criteria', arguments: { block_ids: [10], ...ARGS } })

    expect(sentMethods(spy)).toContain('POST')
  })

  it('handles several blocks with a single load of the criteria table', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-block-criteria', body: [crit(1, 10, 'track_type_id', '1', 1)] },
      { method: 'POST', match: '/smart-block-criteria', body: crit(9, 11, 'track_type_id', '1', 1) },
      { method: 'PATCH', match: '/smart-blocks/11', body: {} },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'add_smart_block_criteria', arguments: { block_ids: [10, 11], ...ARGS } })

    expect(results(result).map((r) => [r.block_id, r.status])).toEqual([[10, 'unchanged'], [11, 'added']])
    expect(countRequests(spy, 'GET', '/smart-block-criteria')).toBe(1)
    expect(countRequests(spy, 'POST', '/smart-block-criteria')).toBe(1)
  })

  it('keeps going when one block fails', async () => {
    stubRoutes([
      { method: 'GET', match: '/smart-block-criteria', body: [] },
      { method: 'POST', match: '/smart-block-criteria', body: {}, ok: false },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'add_smart_block_criteria', arguments: { block_ids: [10, 11], ...ARGS } })

    expect(results(result).map((r) => r.status)).toEqual(['error', 'error'])
  })

  it('reports a warning when the criterion was added but the block date could not be updated', async () => {
    stubRoutes([
      { method: 'GET', match: '/smart-block-criteria', body: [] },
      { method: 'POST', match: '/smart-block-criteria', body: crit(2, 10, 'track_type_id', '1', 1) },
      { method: 'PATCH', match: '/smart-blocks/10', body: {}, ok: false },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'add_smart_block_criteria', arguments: { block_ids: [10], ...ARGS } })

    expect(results(result)).toMatchObject([{ block_id: 10, status: 'added', warning: expect.stringContaining('saved') }])
  })
})
