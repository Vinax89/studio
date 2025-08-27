
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
  importance: number; // New field: 1-5 rating
};

export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";

// This is the type used by the calendar component
export type CalendarDebt = {
  id: string;
  name:string;
  amount: number; // This represents the payment amount in the calendar
  dueDate: string; // ISO anchor date (first due)
  recurrence: Recurrence;
  autopay: boolean;
  notes?: string;
  color?: string;
  paidDates?: string[]; // ISO strings
}

// This is the more detailed type needed for debt cards and AI analysis
export type Debt = {
  id: string;
  name: string;
  initialAmount: number;
  currentAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  recurrence: "once" | "monthly";
  autopay?: boolean;
  color?: string;
};
