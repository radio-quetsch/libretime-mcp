import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/smartblocks/delete_smart_block.js'
import { createTestClient, parseResult } from '../../helpers.js'
import { sentMethods, stubRoutes } from './write.helpers.js'

const BLOCK = { id: 10, name: 'Top 05h', description: '', kind: 'dynamic' }
const item = (id: number, playlist: number, block: number) => ({
  id, kind: 2, position: id, offset: 0, length: null, cue_in: null, cue_out: null,
  fade_in: null, fade_out: null, playlist, file: null, stream: null, block,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('delete_smart_block', () => {
  it('refuses when the block is used in playlists and lists them', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-blocks/10', body: BLOCK },
      { method: 'GET', match: '/playlist-contents', body: [item(1, 5, 10), item(2, 6, 10), item(3, 7, 99)] },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'delete_smart_block', arguments: { block_id: 10 } })

    expect(parseResult(result)).toMatchObject({ status: 'refused', playlist_ids: [5, 6] })
    expect(sentMethods(spy)).not.toContain('DELETE')
  })

  it('deletes an unused block', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-blocks/10', body: BLOCK },
      { method: 'GET', match: '/playlist-contents', body: [item(3, 7, 99)] },
      { method: 'DELETE', match: '/smart-blocks/10', body: {} },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'delete_smart_block', arguments: { block_id: 10 } })

    expect(parseResult(result)).toMatchObject({ status: 'deleted', block: { id: 10 } })
    expect(sentMethods(spy)).toContain('DELETE')
  })

  it('deletes a used block when force is true', async () => {
    const spy = stubRoutes([
      { method: 'GET', match: '/smart-blocks/10', body: BLOCK },
      { method: 'GET', match: '/playlist-contents', body: [item(1, 5, 10)] },
      { method: 'DELETE', match: '/smart-blocks/10', body: {} },
    ])
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'delete_smart_block', arguments: { block_id: 10, force: true } })

    expect(parseResult(result)).toMatchObject({ status: 'deleted', was_used_in_playlists: [5] })
    expect(sentMethods(spy)).toContain('DELETE')
  })
})
