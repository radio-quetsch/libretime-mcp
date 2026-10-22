import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register } from '../../../src/tools/playlists/get_playlists.js'
import { createTestClient, parseResult, jsonResponse } from '../../helpers.js'

const playlist = (id: number, name: string) => ({
  id, name, description: '', length: '00:00:00', owner: 1, created_at: null, updated_at: null,
})
const PLAYLISTS = [playlist(1, 'Podcast - Rock en Vrac'), playlist(2, 'Zwatchka Mix Lundi'), playlist(3, 'RFI - Journal')]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('get_playlists', () => {
  it('returns all playlists when no name is given', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(PLAYLISTS)))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_playlists', arguments: {} })

    expect(parseResult(result)).toHaveLength(3)
  })

  it('filters by case-insensitive name substring', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(PLAYLISTS)))
    const client = await createTestClient(register)

    const result = await client.callTool({ name: 'get_playlists', arguments: { name: 'zwatchka' } })
    const playlists = parseResult(result) as ReturnType<typeof playlist>[]

    expect(playlists.map((p) => p.id)).toEqual([2])
  })
})
