import type { Transaction, Goal, Shift, ShiftTemplate } from './types';

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-15', description: 'Bi-weekly Paycheck', amount: 2500.00, type: 'Income', category: 'Salary', isRecurring: true },
  { id: '2', date: '2024-07-14', description: 'Scrubs & Uniforms', amount: 120.50, type: 'Expense', category: 'Uniforms' },
  { id: '3', date: '2024-07-12', description: 'Groceries', amount: 85.30, type: 'Expense', category: 'Food' },
  { id: '4', date: '2024-07-10', description: 'BLS Certification Renewal', amount: 75.00, type: 'Expense', category: 'Certifications', isRecurring: true },
  { id: '5', date: '2024-07-08', description: 'Student Loan Payment', amount: 350.00, type: 'Expense', category: 'Loans', isRecurring: true },
  { id: '6', date: '2024-07-05', description: 'Gas', amount: 45.00, type: 'Expense', category: 'Transport' },
  { id: '7', date: '2024-07-01', description: 'Bi-weekly Paycheck', amount: 2500.00, type: 'Income', category: 'Salary', isRecurring: true },
  { id: '8', date: '2024-07-01', description: 'Rent', amount: 1200.00, type: 'Expense', category: 'Housing', isRecurring: true },
];

export const mockGoals: Goal[] = [
  { id: '1', name: 'Down Payment for House', targetAmount: 25000, currentAmount: 10500, deadline: '2026-12-31' },
  { id: '2', name: 'Retirement Fund Boost', targetAmount: 10000, currentAmount: 4200, deadline: '2024-12-31' },
  { id: '3', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 14800, deadline: '2024-09-30' },
  { id: '4', name: 'Vacation to Hawaii', targetAmount: 4000, currentAmount: 1250, deadline: '2025-06-01' },
];

export const mockShifts: Shift[] = [
    { id: '1', date: '2024-07-20', type: 'Day', hours: 12 },
    { id: '2', date: '2024-07-21', type: 'Day', hours: 12 },
    { id: '3', date: '2024-07-24', type: 'Night', hours: 12 },
    { id: '4', date: '2024-07-25', type: 'Night', hours: 12 },
    { id: '5', date: '2024-07-28', type: 'Day', hours: 8 },
];

export const mockShiftTemplates: ShiftTemplate[] = [
    {
        id: 'template-1',
        name: '3 on, 4 off (Days)',
        shiftType: 'Day',
        hours: 12,
        days: [
            { day: 'Monday', isWorking: true },
            { day: 'Tuesday', isWorking: true },
            { day: 'Wednesday', isWorking: true },
            { day: 'Thursday', isWorking: false },
            { day: 'Friday', isWorking: false },
            { day: 'Saturday', isWorking: false },
            { day: 'Sunday', isWorking: false },
        ]
    }
];
