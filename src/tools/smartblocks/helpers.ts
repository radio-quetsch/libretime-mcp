import { libreGet, librePatch } from '../../libretime.js'
import { UserSchema } from '../admin/types.js'

const ApiUsersSchema = UserSchema.pick({ id: true, username: true }).array()

/** Current time as an ISO string without milliseconds, the format LibreTime returns. */
export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z')
}

/**
 * Resolve the LibreTime user ID of the API account (matched by LIBRETIME_USER).
 * Returns null when the user cannot be resolved (not listed, or the account cannot read /users),
 * so callers can still proceed without an owner.
 */
export async function getApiUserId(): Promise<number | null> {
  try {
    const users = ApiUsersSchema.parse(await libreGet('/api/v2/users'))
    return users.find((u) => u.username === process.env.LIBRETIME_USER)?.id ?? null
  } catch {
    return null
  }
}

/**
 * Bump a smart block's updated_at after its criteria changed. The LibreTime editor compares
 * this date with the one it loaded, and warns about an outdated version when it is missing or stale.
 * The criteria write has already succeeded at this point, so a failure is returned as a warning
 * instead of being thrown.
 */
export async function touchSmartBlock(blockId: number): Promise<string | undefined> {
  try {
    await librePatch(`/api/v2/smart-blocks/${blockId}`, { updated_at: nowIso() })
  } catch (error) {
    return `The criteria change was saved, but updating the block's modification date failed: ${(error as Error).message}. Reload the block in LibreTime before editing it.`
  }
}
