import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet, librePatch } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockCriteriaSchema } from './types.js'
import { touchSmartBlock } from './helpers.js'

export function register(server: McpServer) {
  server.tool(
    'update_smart_block_criteria',
    'Update one smart block criterion by its ID. Only the provided fields change. Returns the criterion before and after.',
    {
      criteria_id: z.number().describe('Criterion ID (from get_smart_block_criteria)'),
      criteria: z.string().max(32).optional().describe('New field to match'),
      condition: z.string().max(16).optional().describe('New operator'),
      value: z.string().max(512).optional().describe('New value'),
      group: z.number().int().optional().describe('New criteria group'),
      extra: z.string().max(512).optional().describe('New second value'),
    },
    async ({ criteria_id, criteria, condition, value, group, extra }) => {
      const body: Record<string, unknown> = {}
      if (criteria !== undefined) body.criteria = criteria
      if (condition !== undefined) body.condition = condition
      if (value !== undefined) body.value = value
      if (group !== undefined) body.group = group
      if (extra !== undefined) body.extra = extra
      if (Object.keys(body).length === 0) {
        return toolText({ status: 'error', reason: 'Provide at least one field to update.' })
      }

      const before = SmartBlockCriteriaSchema.parse(await libreGet(`/api/v2/smart-block-criteria/${criteria_id}`))
      const after = SmartBlockCriteriaSchema.parse(await librePatch(`/api/v2/smart-block-criteria/${criteria_id}`, body))
      const warning = await touchSmartBlock(after.block)
      return toolText({ status: 'updated', before, after, ...(warning ? { warning } : {}) })
    }
  )
}
