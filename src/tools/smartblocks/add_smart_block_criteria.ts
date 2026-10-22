import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { libreGet, librePost } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockCriteriaSchema } from './types.js'
import { touchSmartBlock } from './helpers.js'

export function register(server: McpServer) {
  server.tool(
    'add_smart_block_criteria',
    'Add the same criterion to one or several smart blocks (one call loads the criteria once, so prefer passing all blocks together). Criteria in the same group are ORed, different groups are ANDed (e.g. genre in group 0, track_type_id in group 1). Technical criteria (sort, limit, repeat_tracks, overflow_tracks) have no group. A block that already has an identical criterion is left unchanged. A failure on one block does not stop the others.',
    {
      block_ids: z.array(z.number().int()).min(1).max(100).describe('Smart block IDs to add the criterion to'),
      criteria: z.string().max(32).describe('Field to match, e.g. genre, track_type_id, album_title'),
      condition: z.string().max(16).describe('Operator, e.g. is, is not, contains'),
      value: z.string().max(512).describe('Value to match'),
      group: z.number().int().optional().describe('Criteria group. Omit for technical criteria.'),
      extra: z.string().max(512).optional().describe('Second value, only for range conditions'),
    },
    async ({ block_ids, criteria, condition, value, group, extra }) => {
      // LibreTime ignores query-string filters, so the whole table is loaded once and filtered per block.
      const all = SmartBlockCriteriaSchema.array().parse(await libreGet('/api/v2/smart-block-criteria'))

      const results = []
      for (const block_id of block_ids) {
        try {
          const duplicate = all.find((c) =>
            c.block === block_id && c.criteria === criteria && c.condition === condition &&
            c.value === value && (c.group ?? null) === (group ?? null)
          )
          if (duplicate) {
            results.push({ block_id, status: 'unchanged', reason: 'Identical criterion already exists.', criteria: duplicate })
            continue
          }

          const added = SmartBlockCriteriaSchema.parse(await librePost('/api/v2/smart-block-criteria', {
            block: block_id,
            criteria,
            condition,
            value,
            group: group ?? null,
            extra: extra ?? null,
          }))
          const warning = await touchSmartBlock(block_id)
          results.push({ block_id, status: 'added', criteria: added, ...(warning ? { warning } : {}) })
        } catch (error) {
          results.push({ block_id, status: 'error', reason: (error as Error).message })
        }
      }
      return toolText({ results })
    }
  )
}
