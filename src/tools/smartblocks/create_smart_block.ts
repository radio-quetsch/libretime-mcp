import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { librePost } from '../../libretime.js'
import { toolText } from '../../tool-response.js'
import { SmartBlockSchema } from './types.js'
import { getApiUserId, nowIso } from './helpers.js'

export function register(server: McpServer) {
  server.tool(
    'create_smart_block',
    'Create an empty smart block. Add its selection rules with add_smart_block_criteria.',
    {
      name: z.string().max(255).describe('Smart block name'),
      description: z.string().max(512).optional().describe('Smart block description'),
      kind: z.enum(['static', 'dynamic']).optional().describe('static or dynamic (default dynamic)'),
    },
    async ({ name, description, kind }) => {
      // Set owner and dates ourselves: LibreTime leaves them null for blocks created through the API,
      // which makes the web editor report an outdated version.
      const now = nowIso()
      const raw = await librePost('/api/v2/smart-blocks', {
        name,
        description: description ?? null,
        kind: kind ?? 'dynamic',
        owner: await getApiUserId(),
        created_at: now,
        updated_at: now,
      })
      return toolText({ status: 'created', block: SmartBlockSchema.parse(raw) })
    }
  )
}
