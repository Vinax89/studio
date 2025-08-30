import { z } from 'zod';

export const NurseRoleEnum = z.enum(['travel', 'staff', 'student']);

export const UserSchema = z.object({
  user_id: z.string(),
  email: z.string().email().nullable().optional(),
  role: NurseRoleEnum,
  first_name: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  home_state: z.string().length(2).nullable().optional(),
  marketing_opt_in: z.boolean().default(false),
  created_at: z.any().optional(),
  last_login: z.any().optional(),
});
export type UserDoc = z.infer<typeof UserSchema>;

export const AccountSchema = z.object({
  user_id: z.string(), item_id: z.string(), name: z.string(),
  official_name: z.string().nullable().optional(), mask: z.string().nullable().optional(),
  type: z.string(), subtype: z.string().nullable().optional(), currency: z.string().default('USD'),
  current_balance: z.number().nullable().optional(), available_balance: z.number().nullable().optional(),
  last_sync_at: z.any().optional(),
});
export type AccountDoc = z.infer<typeof AccountSchema>;

export const TransactionSchema = z.object({
  user_id: z.string(), account_id: z.string(), item_id: z.string(), amount: z.number(),
  iso_currency: z.string().default('USD'), iso_date: z.string(), pending: z.boolean().optional(),
  merchant_name: z.string().nullable().optional(), mcc: z.string().nullable().optional(), location: z.any().nullable().optional(),
  raw_description: z.string().nullable().optional(), category: z.array(z.string()).default([]),
  nurse_category: z.string().nullable().optional(), rule_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(), tags: z.array(z.string()).default([]), duplicates: z.array(z.string()).default([]),
  fingerprint: z.string(), receipt_id: z.string().nullable().optional(), posted_at: z.any().optional(),
  created_at: z.any().optional(), updated_at: z.any().optional(),
});
export type TransactionDoc = z.infer<typeof TransactionSchema>;
