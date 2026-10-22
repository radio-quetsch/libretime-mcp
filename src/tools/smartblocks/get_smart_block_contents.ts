import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockContentSchema } from './types.js'

export function register(server: McpServer) {
  server.tool(
    'get_smart_block_contents',
    'List the files stored in a smart block: the fixed tracks of a static block, or the last generated selection of a dynamic one.',
    {
      block_id: z.number().describe('Smart block ID'),
    },
    async ({ block_id }) => {
      const raw = await libreGet('/api/v2/smart-block-contents', { block: String(block_id) })
      const contents = SmartBlockContentSchema.array().parse(raw)
      // LibreTime ignores the `block` query param and returns every block's contents,
      // so filter client-side.
      return toolText(contents.filter((c) => c.block === block_id))
    }
  )
}
