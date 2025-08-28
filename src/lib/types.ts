import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.enum(["Income", "Expense"]),
  category: z.string(),
  isRecurring: z.boolean().optional()
});
export type Transaction = z.infer<typeof transactionSchema>;

export const goalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  deadline: z.string(),
  importance: z.number()
});
export type Goal = z.infer<typeof goalSchema>;

export interface ChartPoint {
  month: string;
  income: number;
  expenses: number;
}

export const RecurrenceValues = ["none", "weekly", "biweekly", "monthly"] as const;
export const recurrenceSchema = z.enum(RecurrenceValues);
export type Recurrence = z.infer<typeof recurrenceSchema>;

export const debtSchema = z.object({
  id: z.string(),
  name: z.string(),
  initialAmount: z.number(),
  currentAmount: z.number(),
  interestRate: z.number(),
  minimumPayment: z.number(),
  dueDate: z.string(),
  recurrence: recurrenceSchema,
  autopay: z.boolean(),
  notes: z.string().optional(),
  color: z.string().optional(),
  paidDates: z.array(z.string()).optional()
});
export type Debt = z.infer<typeof debtSchema>;
