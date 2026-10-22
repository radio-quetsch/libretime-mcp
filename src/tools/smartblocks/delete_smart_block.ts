import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreDelete, libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockSchema } from './types.js'
import { PlaylistContentSchema } from '../playlists/types.js'

export function register(server: McpServer) {
  server.tool(
    'delete_smart_block',
    'Delete a smart block and its criteria. Refuses if the block is used in a playlist, unless force is true.',
    {
      block_id: z.number().describe('Smart block ID'),
      force: z.boolean().optional().describe('Delete even if playlists still use this block'),
    },
    async ({ block_id, force }) => {
      const block = SmartBlockSchema.parse(await libreGet(`/api/v2/smart-blocks/${block_id}`))

      // Smart blocks are referenced from playlist contents (kind 2) through the `block` field.
      const usedIn = [...new Set(
        PlaylistContentSchema.array().parse(await libreGet('/api/v2/playlist-contents'))
          .filter((c) => c.block === block_id)
          .map((c) => c.playlist)
      )]
      if (usedIn.length > 0 && !force) {
        return toolText({
          status: 'refused',
          reason: `Block is used in ${usedIn.length} playlist(s). Remove it from them or pass force: true.`,
          playlist_ids: usedIn,
        })
      }

      await libreDelete(`/api/v2/smart-blocks/${block_id}`)
      return toolText({ status: 'deleted', block, was_used_in_playlists: usedIn })
    }
  )
}
