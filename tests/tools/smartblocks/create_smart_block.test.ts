import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/create_smart_block.js'
import { createTestClient, parseResult } from '../../helpers.js'
import { sentBody, stubRoutes } from './write.helpers.js'

beforeEach(() => {
  vi.restoreAllMocks()
  vi.stubEnv('LIBRETIME_USER', 'jee')
})

describe('create_smart_block', () => {
  it('creates a dynamic block owned by the API user with creation dates', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/users', body: [{ id: 1, username: 'admin' }, { id: 2, username: 'jee' }] },
      { method: 'POST', match: '/smart-blocks', body: { id: 300, name: 'TEST', description: null, kind: 'dynamic' } },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'create_smart_block', arguments: { name: 'TEST' } })

    const iso = expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    expect(sentBody(spy, 'POST')).toEqual({ name: 'TEST', description: null, kind: 'dynamic', owner: 2, created_at: iso, updated_at: iso })
    expect(parseResult(result)).toMatchObject({ status: 'created', block: { id: 300 } })
  })

  it('still creates the block, without an owner, when the users cannot be read', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/users', body: {}, ok: false },
      { method: 'POST', match: '/smart-blocks', body: { id: 301, name: 'TEST', description: null, kind: 'dynamic' } },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'create_smart_block', arguments: { name: 'TEST' } })

    expect(parseResult(result)).toMatchObject({ status: 'created', block: { id: 301 } })
    expect(sentBody(spy, 'POST')).toMatchObject({ owner: null })
  })
})
