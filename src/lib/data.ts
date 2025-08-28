
import type { Transaction, Goal, Debt, Category } from './types';

export const mockCategories: Category[] = [
  { id: 'salary', name: 'Salary' },
  { id: 'uniforms', name: 'Uniforms', monthlyBudget: 200 },
  { id: 'food', name: 'Food', monthlyBudget: 500 },
  { id: 'certifications', name: 'Certifications', monthlyBudget: 100 },
  { id: 'loans', name: 'Loans', monthlyBudget: 400 },
  { id: 'transport', name: 'Transport', monthlyBudget: 150 },
  { id: 'housing', name: 'Housing', monthlyBudget: 1200 },
];

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-15', description: 'Bi-weekly Paycheck', amount: 2500.00, type: 'Income', category: 'Salary', categoryId: 'salary', isRecurring: true },
  { id: '2', date: '2024-07-14', description: 'Scrubs & Uniforms', amount: 120.50, type: 'Expense', category: 'Uniforms', categoryId: 'uniforms' },
  { id: '3', date: '2024-07-12', description: 'Groceries', amount: 85.30, type: 'Expense', category: 'Food', categoryId: 'food' },
  { id: '4', date: '2024-07-10', description: 'BLS Certification Renewal', amount: 75.00, type: 'Expense', category: 'Certifications', categoryId: 'certifications', isRecurring: true },
  { id: '5', date: '2024-07-08', description: 'Student Loan Payment', amount: 350.00, type: 'Expense', category: 'Loans', categoryId: 'loans', isRecurring: true },
  { id: '6', date: '2024-07-05', description: 'Gas', amount: 45.00, type: 'Expense', category: 'Transport', categoryId: 'transport' },
  { id: '7', date: '2024-07-01', description: 'Bi-weekly Paycheck', amount: 2500.00, type: 'Income', category: 'Salary', categoryId: 'salary', isRecurring: true },
  { id: '8', date: '2024-07-01', description: 'Rent', amount: 1200.00, type: 'Expense', category: 'Housing', categoryId: 'housing', isRecurring: true },
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
