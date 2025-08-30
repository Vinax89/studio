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
  user_id: z.string(),
  item_id: z.string(),
  name: z.string(),
  official_name: z.string().nullable().optional(),
  mask: z.string().nullable().optional(),
  type: z.string(),
  subtype: z.string().nullable().optional(),
  currency: z.string().default('USD'),
  current_balance: z.number().nullable().optional(),
  available_balance: z.number().nullable().optional(),
  last_sync_at: z.any().optional(),
});
export type AccountDoc = z.infer<typeof AccountSchema>;

export const TransactionSchema = z.object({
  user_id: z.string(),
  account_id: z.string(),
  item_id: z.string(),
  amount: z.number(),
  iso_currency: z.string().default('USD'),
  iso_date: z.string(),
  pending: z.boolean().optional(),
  merchant_name: z.string().nullable().optional(),
  mcc: z.string().nullable().optional(),
  location: z.any().nullable().optional(),
  raw_description: z.string().nullable().optional(),
  category: z.array(z.string()).default([]),
  nurse_category: z.string().nullable().optional(),
  rule_id: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  duplicates: z.array(z.string()).default([]),
  fingerprint: z.string(),
  receipt_id: z.string().nullable().optional(),
  posted_at: z.any().optional(),
  created_at: z.any().optional(),
  updated_at: z.any().optional(),
});
export type TransactionDoc = z.infer<typeof TransactionSchema>;

export const RuleMatchSchema = z.object({
  merchant: z.string().optional(),
  mcc: z.string().optional(),
  amount_tolerance: z.number().optional(),
  contains: z.array(z.string()).optional(),
});
export const RuleActionSchema = z.object({
  nurse_category: z.string(),
  split: z.array(
    z.object({ pct: z.number().optional(), amount: z.number().optional(), category: z.string() })
  ).optional(),
});
export const RuleSchema = z.object({
  user_id: z.string(),
  priority: z.number().int().min(0).default(100),
  enabled: z.boolean().default(true),
  match: RuleMatchSchema,
  action: RuleActionSchema,
});
export type RuleDoc = z.infer<typeof RuleSchema>;

export const ReceiptSchema = z.object({
  user_id: z.string(),
  storage_path: z.string(),
  sha256: z.string(),
  source: z.enum(['upload', 'email', 'sms']).default('upload'),
  ocr: z.object({ status: z.string(), provider: z.string(), extracted_at: z.any().optional(), kv: z.any().optional() }).optional(),
  linked_tx: z.array(z.string()).default([]),
  created_at: z.any().optional(),
});
export type ReceiptDoc = z.infer<typeof ReceiptSchema>;

export const PaystubSchema = z.object({
  user_id: z.string(),
  storage_path: z.string(),
  sha256: z.string(),
  pay_period: z.object({ start: z.string(), end: z.string(), pay_date: z.string() }),
  employer: z.string().nullable().optional(),
  gross_pay: z.number().nullable().optional(),
  net_pay: z.number().nullable().optional(),
  components: z.array(z.object({ type: z.string(), amount: z.number() })).optional(),
  taxes: z.array(z.object({ code: z.string(), amount: z.number() })).optional(),
  hours: z.object({ regular: z.number().optional(), ot: z.number().optional(), double: z.number().optional() }).optional(),
  stipends: z.object({ housing: z.number().optional(), meals: z.number().optional(), travel: z.number().optional() }).optional(),
  parsed_confidence: z.number().nullable().optional(),
  linked_tx: z.array(z.string()).default([]),
});
export type PaystubDoc = z.infer<typeof PaystubSchema>;

export const AssignmentSchema = z.object({
  user_id: z.string(),
  agency: z.string(),
  facility: z.string(),
  state: z.string().length(2),
  specialty: z.string().optional(),
  bill_rate: z.number().optional(),
  ot_rate: z.number().optional(),
  stipend: z.object({ housing: z.number().optional(), meals: z.number().optional() }).partial(),
  shifts_per_week: z.number().optional(),
  start: z.string(),
  end: z.string(),
  contract_pdf: z.string().nullable().optional(),
});
export type AssignmentDoc = z.infer<typeof AssignmentSchema>;

export const BudgetEnvelopeSchema = z.object({ category: z.string(), planned: z.number(), carryover: z.boolean().default(false) });
export const BudgetSchema = z.object({
  user_id: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  envelopes: z.array(BudgetEnvelopeSchema),
  locked: z.boolean().default(false),
});
export type BudgetDoc = z.infer<typeof BudgetSchema>;

export const DebtSchema = z.object({
  user_id: z.string(),
  kind: z.enum(['loan', 'card', 'other']),
  name: z.string(),
  apr: z.number().nonnegative(),
  balance: z.number().nonnegative(),
  min_payment: z.number().nonnegative(),
  due_day: z.number().int().min(1).max(28),
  extra_payment: z.number().nonnegative().default(0),
});
export type DebtDoc = z.infer<typeof DebtSchema>;

export const GoalSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  target_amount: z.number().positive(),
  target_date: z.string(),
  funding_strategy: z.enum(['monthly', 'windfall', 'roundups']).default('monthly'),
  envelope_category: z.string().nullable().optional(),
});
export type GoalDoc = z.infer<typeof GoalSchema>;

export const TaxProfileSchema = z.object({
  user_id: z.string(),
  filing_status: z.enum(['single', 'married_joint', 'married_separate', 'head_household']),
  dependents: z.number().int().min(0).default(0),
  w4_allowances: z.number().int().min(0).default(0),
  additional_withholding: z.number().min(0).default(0),
  roth_contribs_year_to_date: z.number().min(0).default(0),
  hsa_fsa: z.number().min(0).default(0),
});
export type TaxProfileDoc = z.infer<typeof TaxProfileSchema>;

// Useful constants
export const NurseCategories = [
  'scrubs', 'ceus', 'licensure', 'agency_fees', 'housing_stipend_overage', 'mileage', 'lodging',
  'per_diem', 'union_dues', 'equipment', 'parking', 'meals_on_shift', 'certifications', 'travel_misc'
] as const;
export type NurseCategory = typeof NurseCategories[number];
