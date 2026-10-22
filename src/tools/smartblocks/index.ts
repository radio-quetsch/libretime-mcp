import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { register as registerGetSmartBlocks } from './get_smart_blocks.js'
import { register as registerGetSmartBlock } from './get_smart_block.js'
import { register as registerGetSmartBlockCriteria } from './get_smart_block_criteria.js'
import { register as registerGetSmartBlockContents } from './get_smart_block_contents.js'
import { register as registerAddSmartBlockCriteria } from './add_smart_block_criteria.js'
import { register as registerUpdateSmartBlockCriteria } from './update_smart_block_criteria.js'
import { register as registerDeleteSmartBlockCriteria } from './delete_smart_block_criteria.js'
import { register as registerCreateSmartBlock } from './create_smart_block.js'
import { register as registerUpdateSmartBlock } from './update_smart_block.js'
import { register as registerDeleteSmartBlock } from './delete_smart_block.js'

export function register(server: McpServer) {
  registerGetSmartBlocks(server)
  registerGetSmartBlock(server)
  registerGetSmartBlockCriteria(server)
  registerGetSmartBlockContents(server)
  registerAddSmartBlockCriteria(server)
  registerUpdateSmartBlockCriteria(server)
  registerDeleteSmartBlockCriteria(server)
  registerCreateSmartBlock(server)
  registerUpdateSmartBlock(server)
  registerDeleteSmartBlock(server)
}
