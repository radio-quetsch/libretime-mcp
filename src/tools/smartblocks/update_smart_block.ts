import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet, librePatch } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockSchema } from './types.js'

export function register(server: McpServer) {
  server.tool(
    'update_smart_block',
    'Rename a smart block or change its description. Playlists reference blocks by ID, so renaming is safe. Returns the block before and after.',
    {
      block_id: z.number().describe('Smart block ID'),
      name: z.string().max(255).optional().describe('New name'),
      description: z.string().max(512).optional().describe('New description'),
    },
    async ({ block_id, name, description }) => {
      const body: Record<string, unknown> = {}
      if (name !== undefined) body.name = name
      if (description !== undefined) body.description = description
      if (Object.keys(body).length === 0) {
        return toolText({ status: 'error', reason: 'Provide a name or a description to update.' })
      }

      const before = SmartBlockSchema.parse(await libreGet(`/api/v2/smart-blocks/${block_id}`))
      const after = SmartBlockSchema.parse(await librePatch(`/api/v2/smart-blocks/${block_id}`, body))
      return toolText({ status: 'updated', before, after })
    }
  )
}
