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

export type Debt = {
    id: string;
    name: string;
    totalAmount: number;
    minimumPayment: number;
    dueDate: string; // ISO date string for the start date
    recurrence: 'once' | 'monthly';
}
