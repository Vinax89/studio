
import type { Transaction, Goal, Debt, CalendarDebt } from './types';

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

// This is the seed data for the interactive calendar.
export const mockDebts: CalendarDebt[] = [
    { id: "student-loan", name: "Student Loan", amount: 350, dueDate: "2024-08-08", recurrence: "monthly", autopay: true, color: "#fca5a5" },
    { id: "car-loan", name: "Car Loan", amount: 275, dueDate: "2024-08-20", recurrence: "monthly", autopay: true, color: "#fdba74" },
    { id: "credit-card", name: "Credit Card", amount: 100, dueDate: "2024-08-25", recurrence: "monthly", autopay: false, color: "#818cf8" },
    { id: "hospital-bill", name: "Hospital Bill", amount: 500, dueDate: new Date().toISOString().split('T')[0], recurrence: "none", autopay: false, color: "#a5b4fc" },
];
