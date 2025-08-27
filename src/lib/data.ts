import type { Transaction, Goal, Debt } from './types';

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

export const mockDebts: Debt[] = [
    { id: '1', name: 'Student Loan', initialAmount: 22000, currentAmount: 18500, interestRate: 5.8, minimumPayment: 350, dueDate: '2024-01-08', recurrence: 'monthly' },
    { id: '2', name: 'Car Loan', initialAmount: 15000, currentAmount: 8200, interestRate: 4.2, minimumPayment: 275, dueDate: '2024-01-20', recurrence: 'monthly' },
    { id: '3', name: 'Credit Card', initialAmount: 2500, currentAmount: 1100, interestRate: 21.9, minimumPayment: 100, dueDate: '2024-01-25', recurrence: 'monthly' },
    { id: '4', name: 'Hospital Bill', initialAmount: 500, currentAmount: 0, interestRate: 0, minimumPayment: 500, dueDate: new Date().toISOString().split('T')[0], recurrence: 'once' },
];
