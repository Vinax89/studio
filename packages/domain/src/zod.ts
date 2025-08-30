import { z } from 'zod';

// Budget envelope and main schemas
export const BudgetEnvelopeSchema = z.object({
  category: z.string(),
  planned: z.number(),
  carryover: z.boolean().optional(),
});

export const BudgetSchema = z.object({
  user_id: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  envelopes: z.array(BudgetEnvelopeSchema),
  locked: z.boolean().optional(),
  created_at: z.any().optional(),
});
export type BudgetDoc = z.infer<typeof BudgetSchema>;

export const GoalSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  target_amount: z.number().positive(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  funding_strategy: z.string().optional(),
  created_at: z.any().optional(),
});
export type GoalDoc = z.infer<typeof GoalSchema>;

// Spend summaries capture aggregated monthly totals
export const SpendSummarySchema = z.object({
  user_id: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  totals_by_category: z.record(z.number()).default({}),
  total_spent: z.number().default(0),
  total_income: z.number().default(0),
  tx_count: z.number().default(0),
  updated_at: z.any().optional(),
});
export type SpendSummaryDoc = z.infer<typeof SpendSummarySchema>;

// Goal contributions track manual deposits towards a goal
export const GoalContributionSchema = z.object({
  user_id: z.string(),
  goal_id: z.string(),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().optional(),
  created_at: z.any().optional(),
});
export type GoalContributionDoc = z.infer<typeof GoalContributionSchema>;

