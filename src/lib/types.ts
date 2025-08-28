
export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string; // ISO currency code
  type: "Income" | "Expense";
  category: string;
  isRecurring?: boolean;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  importance: number; // New field: 1-5 rating
};

export interface ChartPoint {
  month: string;
  income: number;
  expenses: number;
}

export const RecurrenceValues = ["none", "weekly", "biweekly", "monthly"] as const;
export type Recurrence = typeof RecurrenceValues[number];

// This is the unified, authoritative Debt type used across the app.
export type Debt = {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  interestRate: number;
  minimumPayment: number;
  // Due date handling:
  // For recurring debts, this is the anchor date for recurrence calculation.
  // For one-time debts, this is the specific due date.
  dueDate: string; 
  recurrence: Recurrence;
  autopay: boolean;
  notes?: string;
  color?: string;
  paidDates?: string[]; // ISO strings of dates where a payment was manually marked as paid
};
