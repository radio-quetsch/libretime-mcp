import { z } from 'zod'

export const SmartBlockSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  length: z.string().nullable().optional(),
  kind: z.string().nullable().optional().describe('static or dynamic'),
  owner: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough()
export type SmartBlock = z.infer<typeof SmartBlockSchema>

export const SmartBlockCriteriaSchema = z.object({
  id: z.number(),
  block: z.number(),
  group: z.number().nullable(),
  criteria: z.string().describe('Field to match, e.g. genre, track_type_id, sort, limit'),
  condition: z.string().describe('Operator, e.g. is, contains, before, items, minutes'),
  value: z.string(),
  extra: z.string().nullable().optional(),
}).passthrough()
export type SmartBlockCriteria = z.infer<typeof SmartBlockCriteriaSchema>

export const SmartBlockContentSchema = z.object({
  id: z.number(),
  block: z.number().nullable(),
  file: z.number().nullable(),
  position: z.number().nullable(),
  offset: z.number(),
  length: z.string().nullable().optional(),
  cue_in: z.string().nullable().optional(),
  cue_out: z.string().nullable().optional(),
  fade_in: z.string().nullable().optional(),
  fade_out: z.string().nullable().optional(),
}).passthrough()
export type SmartBlockContent = z.infer<typeof SmartBlockContentSchema>
