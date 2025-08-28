import { ZodError } from 'zod';

jest.mock('@/ai/genkit', () => {
  const flowMocks: jest.Mock[] = [];
  return {
    ai: {
      definePrompt: jest.fn(() => jest.fn()),
      defineFlow: jest.fn(() => {
        const fn = jest.fn();
        flowMocks.push(fn);
        return fn;
      }),
    },
    flowMocks,
  };
});

import { flowMocks } from '@/ai/genkit';
import { analyzeReceipt } from '@/ai/flows/analyze-receipt';
import { analyzeSpendingHabits } from '@/ai/flows/analyze-spending-habits';
import { calculateCashflow } from '@/ai/flows/calculate-cashflow';
import { suggestDebtStrategy } from '@/ai/flows/suggest-debt-strategy';
import { estimateTax } from '@/ai/flows/tax-estimation';

const [
  analyzeReceiptMock,
  analyzeSpendingHabitsMock,
  calculateCashflowMock,
  suggestDebtStrategyMock,
  estimateTaxMock,
] = flowMocks as jest.Mock[];

describe('AI flow input validation', () => {
  test('analyzeReceipt', async () => {
    analyzeReceiptMock.mockResolvedValue({ description: '', amount: 1, category: 'Food' });
    const valid = { receiptImage: 'data:image/png;base64,abc' };
    await expect(analyzeReceipt(valid)).resolves.toEqual({ description: '', amount: 1, category: 'Food' });
    expect(analyzeReceiptMock).toHaveBeenCalledWith(valid);

    await expect(analyzeReceipt({ receiptImage: 123 } as any)).rejects.toBeInstanceOf(ZodError);
    expect(analyzeReceiptMock).toHaveBeenCalledTimes(1);
  });

  test('analyzeSpendingHabits', async () => {
    analyzeSpendingHabitsMock.mockResolvedValue({ spendingAnalysis: '', savingsOpportunities: '', recommendations: '' });
    const valid = {
      financialDocuments: ['data:text/plain;base64,abc'],
      userDescription: 'desc',
      goals: [{ id: '1', name: 'goal', targetAmount: 100, currentAmount: 50, deadline: '2024-12-31', importance: 3 }],
    };
    await expect(analyzeSpendingHabits(valid)).resolves.toEqual({ spendingAnalysis: '', savingsOpportunities: '', recommendations: '' });
    expect(analyzeSpendingHabitsMock).toHaveBeenCalledWith(valid);

    await expect(analyzeSpendingHabits({ financialDocuments: 'bad' } as any)).rejects.toBeInstanceOf(ZodError);
    expect(analyzeSpendingHabitsMock).toHaveBeenCalledTimes(1);
  });

  test('calculateCashflow', async () => {
    calculateCashflowMock.mockResolvedValue({ grossMonthlyIncome: 0, netMonthlyIncome: 0, analysis: '' });
    const valid = { annualIncome: 50000, estimatedAnnualTaxes: 10000, totalMonthlyDeductions: 2000 };
    await expect(calculateCashflow(valid)).resolves.toEqual({ grossMonthlyIncome: 0, netMonthlyIncome: 0, analysis: '' });
    expect(calculateCashflowMock).toHaveBeenCalledWith(valid);

    await expect(calculateCashflow({ annualIncome: '50000' } as any)).rejects.toBeInstanceOf(ZodError);
    expect(calculateCashflowMock).toHaveBeenCalledTimes(1);
  });

  test('suggestDebtStrategy', async () => {
    suggestDebtStrategyMock.mockResolvedValue({ recommendedStrategy: 'avalanche', strategyReasoning: '', payoffOrder: [], summary: '' });
    const valid = {
      debts: [
        {
          id: '1',
          name: 'loan',
          initialAmount: 1000,
          currentAmount: 800,
          interestRate: 5,
          minimumPayment: 50,
          dueDate: '2024-01-01',
          recurrence: 'monthly',
        },
      ],
    };
    await expect(suggestDebtStrategy(valid)).resolves.toEqual({ recommendedStrategy: 'avalanche', strategyReasoning: '', payoffOrder: [], summary: '' });
    expect(suggestDebtStrategyMock).toHaveBeenCalledWith(valid);

    await expect(suggestDebtStrategy({ debts: 'bad' } as any)).rejects.toBeInstanceOf(ZodError);
    expect(suggestDebtStrategyMock).toHaveBeenCalledTimes(1);
  });

  test('estimateTax', async () => {
    estimateTaxMock.mockResolvedValue({ estimatedTax: 0, taxRate: 0, breakdown: '' });
    const valid = { income: 60000, deductions: 5000, location: 'NY', filingStatus: 'single' };
    await expect(estimateTax(valid)).resolves.toEqual({ estimatedTax: 0, taxRate: 0, breakdown: '' });
    expect(estimateTaxMock).toHaveBeenCalledWith(valid);

    await expect(estimateTax({ income: 60000, deductions: 5000, location: 'NY', filingStatus: 'invalid' } as any)).rejects.toBeInstanceOf(ZodError);
    expect(estimateTaxMock).toHaveBeenCalledTimes(1);
  });
});
