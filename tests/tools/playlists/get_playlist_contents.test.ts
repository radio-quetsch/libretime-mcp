import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/playlists/get_playlist_contents.js'
import { createTestClient, parseResult, jsonResponse } from '../../helpers.js'

const item = (id: number, playlist: number) => ({
  id, kind: 0, position: id, offset: 0, length: '00:03:00',
  cue_in: '00:00:00', cue_out: '00:03:00', fade_in: null, fade_out: null,
  playlist, file: id + 100, stream: null,
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get_playlist_contents', () => {
  it('returns only the items of the requested playlist', async () => {
    // The API ignores the ?playlist= param and returns every playlist's items
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([item(1, 5), item(2, 6), item(3, 5)])))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_playlist_contents', arguments: { playlist_id: 5 } })
    const contents = parseResult(result) as ReturnType<typeof item>[]

    expect(contents.map((c) => c.id)).toEqual([1, 3])
  })
})
