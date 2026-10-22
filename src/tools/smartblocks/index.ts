import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { register as registerGetSmartBlocks } from './get_smart_blocks.js'
import { register as registerGetSmartBlock } from './get_smart_block.js'
import { register as registerGetSmartBlockCriteria } from './get_smart_block_criteria.js'
import { register as registerGetSmartBlockContents } from './get_smart_block_contents.js'

export function register(server: McpServer) {
  registerGetSmartBlocks(server)
  registerGetSmartBlock(server)
  registerGetSmartBlockCriteria(server)
  registerGetSmartBlockContents(server)
}
