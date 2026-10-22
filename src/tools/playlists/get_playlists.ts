import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { PlaylistSchema } from './types.js'

export function register(server: McpServer) {
  server.tool(
    'get_playlists',
    'List playlists in the LibreTime media library, optionally filtered by name.',
    {
      name: z.string().optional().describe('Case-insensitive substring to match against the playlist name'),
    },
    async ({ name }) => {
      const raw = await libreGet('/api/v2/playlists')
      const playlists = PlaylistSchema.array().parse(raw)
      // LibreTime has no server-side name filter, so match client-side.
      const needle = name?.toLowerCase()
      return toolText(needle ? playlists.filter((p) => p.name.toLowerCase().includes(needle)) : playlists)
    }
  )
}
