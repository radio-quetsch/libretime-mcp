import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockContentSchema, SmartBlockCriteriaSchema, SmartBlockSchema } from './types.js'

export function register(server: McpServer) {
  server.tool(
    'get_smart_block',
    'Get one smart block with its criteria (grouped by criteria group) and its contents.',
    {
      block_id: z.number().describe('Smart block ID'),
    },
    async ({ block_id }) => {
      const [rawBlock, rawCriteria, rawContents] = await Promise.all([
        libreGet(`/api/v2/smart-blocks/${block_id}`),
        libreGet('/api/v2/smart-block-criteria', { block: String(block_id) }),
        libreGet('/api/v2/smart-block-contents', { block: String(block_id) }),
      ])

      const block = SmartBlockSchema.parse(rawBlock)
      // LibreTime ignores the `block` query param on both list endpoints,
      // so filter client-side.
      const criteria = SmartBlockCriteriaSchema.array().parse(rawCriteria)
        .filter((c) => c.block === block_id)
        .sort((a, b) => a.id - b.id)
      const contents = SmartBlockContentSchema.array().parse(rawContents)
        .filter((c) => c.block === block_id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

      const groups: Record<string, { criteria: string; condition: string; value: string; extra?: string | null }[]> = {}
      for (const { group, criteria: field, condition, value, extra } of criteria) {
        const key = String(group ?? 0)
        ;(groups[key] ??= []).push({ criteria: field, condition, value, ...(extra ? { extra } : {}) })
      }

      return toolText({ ...block, criteria_groups: groups, contents })
    }
  )
}
