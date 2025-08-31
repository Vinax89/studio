import { z } from "zod";

export const RecurrenceValues = ["none", "weekly", "biweekly", "monthly"] as const;
export const RecurrenceSchema = z.enum(RecurrenceValues);
export type Recurrence = z.infer<typeof RecurrenceSchema>;

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.enum(["Income", "Expense"]),
  category: z.string(),
  isRecurring: z.boolean().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  deadline: z.string(),
  importance: z.number(),
});
export type Goal = z.infer<typeof GoalSchema>;

export const ChartPointSchema = z.object({
  month: z.string(),
  income: z.number(),
  expenses: z.number(),
});
export type ChartPoint = z.infer<typeof ChartPointSchema>;

export const DebtAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  initialAmount: z.number(),
  currentAmount: z.number(),
  interestRate: z.number(),
  minimumPayment: z.number(),
  dueDate: z.string(),
  recurrence: RecurrenceSchema,
  autopay: z.boolean(),
  notes: z.string().optional(),
  color: z.string().optional(),
  paidDates: z.array(z.string()).optional(),
});
export type DebtAccount = z.infer<typeof DebtAccountSchema>;

