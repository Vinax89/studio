
export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
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
};

export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";

export type Debt = {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO anchor date (first due)
  recurrence: Recurrence;
  autopay: boolean;
  notes?: string;
  color?: string;
  paidDates?: string[]; // ISO strings
}
