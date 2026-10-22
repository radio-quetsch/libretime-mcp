import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreDelete, libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockCriteriaSchema } from './types.js'
import { touchSmartBlock } from './helpers.js'

export function register(server: McpServer) {
  server.tool(
    'delete_smart_block_criteria',
    'Delete one smart block criterion by its ID. Returns the deleted criterion so it can be re-added if needed.',
    {
      criteria_id: z.number().describe('Criterion ID (from get_smart_block_criteria)'),
    },
    async ({ criteria_id }) => {
      const criteria = SmartBlockCriteriaSchema.parse(await libreGet(`/api/v2/smart-block-criteria/${criteria_id}`))
      await libreDelete(`/api/v2/smart-block-criteria/${criteria_id}`)
      const warning = await touchSmartBlock(criteria.block)
      return toolText({ status: 'deleted', criteria, ...(warning ? { warning } : {}) })
    }
  )
}
