import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockCriteriaSchema } from './types.js'

export function register(server: McpServer) {
  server.tool(
    'get_smart_block_criteria',
    'List the selection criteria (genre, track type, sort, limit, ...) of a smart block.',
    {
      block_id: z.number().describe('Smart block ID'),
    },
    async ({ block_id }) => {
      const raw = await libreGet('/api/v2/smart-block-criteria', { block: String(block_id) })
      const criteria = SmartBlockCriteriaSchema.array().parse(raw)
      // LibreTime ignores the `block` query param and returns every block's criteria,
      // so filter client-side.
      return toolText(criteria.filter((c) => c.block === block_id))
    }
  )
}
