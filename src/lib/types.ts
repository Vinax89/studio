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

export type Shift = {
    id: string;
    date: string;
    type: 'Day' | 'Night' | 'Evening';
    hours: number;
}

export type ShiftTemplate = {
    id: string;
    name: string;
    shiftType: 'Day' | 'Night' | 'Evening';
    hours: number;
    days: { day: string; isWorking: boolean }[];
}
