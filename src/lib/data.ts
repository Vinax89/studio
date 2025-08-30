
import type { Transaction, Goal, Debt } from './types';

export const mockTransactions: Transaction[] = [
  { id: '1', userId: 'demo-user', date: '2024-07-15', description: 'Bi-weekly Paycheck', amount: 2500.0, currency: 'USD', type: 'Income', category: 'Salary', isRecurring: true },
  { id: '2', userId: 'demo-user', date: '2024-07-14', description: 'Scrubs & Uniforms', amount: 120.5, currency: 'USD', type: 'Expense', category: 'Uniforms' },
  { id: '3', userId: 'demo-user', date: '2024-07-12', description: 'Groceries', amount: 85.3, currency: 'USD', type: 'Expense', category: 'Food' },
  { id: '4', userId: 'demo-user', date: '2024-07-10', description: 'BLS Certification Renewal', amount: 75.0, currency: 'USD', type: 'Expense', category: 'Certifications', isRecurring: true },
  { id: '5', userId: 'demo-user', date: '2024-07-08', description: 'Student Loan Payment', amount: 350.0, currency: 'USD', type: 'Expense', category: 'Loans', isRecurring: true },
  { id: '6', userId: 'demo-user', date: '2024-07-05', description: 'Gas', amount: 45.0, currency: 'USD', type: 'Expense', category: 'Transport' },
  { id: '7', userId: 'demo-user', date: '2024-07-01', description: 'Bi-weekly Paycheck', amount: 2500.0, currency: 'USD', type: 'Income', category: 'Salary', isRecurring: true },
  { id: '8', userId: 'demo-user', date: '2024-07-01', description: 'Rent', amount: 1200.0, currency: 'USD', type: 'Expense', category: 'Housing', isRecurring: true },
];

export const mockGoals: Goal[] = [
  { id: '1', name: 'Down Payment for House', targetAmount: 25000, currentAmount: 10500, deadline: '2026-12-31', importance: 5 },
  { id: '2', name: 'Retirement Fund Boost', targetAmount: 10000, currentAmount: 4200, deadline: '2024-12-31', importance: 4 },
  { id: '3', name: 'Emergency Fund', targetAmount: 15000, currentAmount: 14800, deadline: '2024-09-30', importance: 5 },
  { id: '4', name: 'Vacation to Hawaii', targetAmount: 4000, currentAmount: 1250, deadline: '2025-06-01', importance: 2 },
];

// This is the seed data for the interactive calendar, now using the unified Debt type.
export const mockDebts: Debt[] = [
    { 
        id: "student-loan", 
        name: "Student Loan", 
        initialAmount: 25000,
        currentAmount: 18500,
        interestRate: 5.8,
        minimumPayment: 350, 
        dueDate: "2024-08-08", 
        recurrence: "monthly", 
        autopay: true, 
        color: "#fca5a5" 
    },
    { 
        id: "car-loan", 
        name: "Car Loan", 
        initialAmount: 18000,
        currentAmount: 9800,
        interestRate: 4.2,
        minimumPayment: 275, 
        dueDate: "2024-08-20", 
        recurrence: "monthly", 
        autopay: true, 
        color: "#fdba74" 
    },
    { 
        id: "credit-card", 
        name: "Credit Card", 
        initialAmount: 5000,
        currentAmount: 2100,
        interestRate: 21.9,
        minimumPayment: 100, 
        dueDate: "2024-08-25", 
        recurrence: "monthly", 
        autopay: false, 
        color: "#818cf8" 
    },
    { 
        id: "hospital-bill", 
        name: "Hospital Bill", 
        initialAmount: 500,
        currentAmount: 500,
        interestRate: 0,
        minimumPayment: 500, 
        dueDate: new Date().toISOString().split('T')[0], 
        recurrence: "none", 
        autopay: false, 
        color: "#a5b4fc" 
    },
];
