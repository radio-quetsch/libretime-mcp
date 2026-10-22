import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockSchema } from './types.js'

export function register(server: McpServer) {
  server.tool(
    'get_smart_blocks',
    'List smart blocks, optionally filtered by name. Use get_smart_block to see the criteria and contents of one block.',
    {
      name: z.string().optional().describe('Case-insensitive substring to match against the smart block name'),
    },
    async ({ name }) => {
      const raw = await libreGet('/api/v2/smart-blocks')
      const blocks = SmartBlockSchema.array().parse(raw)
      // LibreTime has no server-side name filter, so match client-side.
      const needle = name?.toLowerCase()
      return toolText(needle ? blocks.filter((b) => b.name.toLowerCase().includes(needle)) : blocks)
    }
  )
}
