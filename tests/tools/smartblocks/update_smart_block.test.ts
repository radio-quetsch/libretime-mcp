import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/update_smart_block.js'
import { createTestClient, parseResult } from '../../helpers.js'
import { sentBody, sentMethods, stubRoutes } from './write.helpers.js'

const block = (name: string) => ({ id: 10, name, description: '', kind: 'dynamic' })

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('update_smart_block', () => {
  it('renames the block and returns before and after', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-blocks/10', body: block('Old') },
      { method: 'PATCH', match: '/smart-blocks/10', body: block('New') },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'update_smart_block', arguments: { block_id: 10, name: 'New' } })

    expect(sentBody(spy, 'PATCH')).toEqual({ name: 'New' })
    expect(parseResult(result)).toMatchObject({ status: 'updated', before: { name: 'Old' }, after: { name: 'New' } })
  })

  it('refuses to run without a name or description', async () => {
    const spy = stubRoutes([])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'update_smart_block', arguments: { block_id: 10 } })

    expect(parseResult(result)).toMatchObject({ status: 'error' })
    expect(sentMethods(spy)).toEqual([])
  })
})
