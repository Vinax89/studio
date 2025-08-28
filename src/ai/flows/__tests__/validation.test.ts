import { z } from 'zod';

function setupValidationMocks(output: any) {
  const definePromptMock = jest.fn().mockReturnValue(async () => ({ output }));
  const defineFlowMock = jest.fn((config: any, handler: any) => {
    return async (input: any) => {
      const parsedInput = config.inputSchema.parse(input);
      const result = await handler(parsedInput);
      return config.outputSchema.parse(result);
    };
  });
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
}

describe('calculateCashflow validation', () => {
  it('rejects negative values', async () => {
    jest.resetModules();
    setupValidationMocks({ grossMonthlyIncome: 0, netMonthlyIncome: 0, analysis: '' });
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({
        annualIncome: -1,
        estimatedAnnualTaxes: 1000,
        totalMonthlyDeductions: 100,
      })
    ).rejects.toThrow();
  });
});

describe('taxEstimation validation', () => {
  it('rejects negative income', async () => {
    jest.resetModules();
    setupValidationMocks({ estimatedTax: 0, taxRate: 0, breakdown: '' });
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({ income: -5000, deductions: 0, location: 'NY', filingStatus: 'single' })
    ).rejects.toThrow();
  });

  it('rejects taxRate over 100', async () => {
    jest.resetModules();
    setupValidationMocks({ estimatedTax: 1000, taxRate: 150, breakdown: 'invalid rate' });
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({ income: 50000, deductions: 10000, location: 'NY', filingStatus: 'single' })
    ).rejects.toThrow();
  });
});

describe('suggestDebtStrategy validation', () => {
  const validDebt = {
    id: '1',
    name: 'Debt',
    initialAmount: 1000,
    currentAmount: 500,
    interestRate: 5,
    minimumPayment: 50,
    dueDate: '2024-01-01',
    recurrence: 'monthly',
  };

  it('rejects negative currentAmount', async () => {
    jest.resetModules();
    setupValidationMocks({
      recommendedStrategy: 'avalanche',
      strategyReasoning: '',
      payoffOrder: [{ debtName: 'Debt', priority: 1 }],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({
        debts: [{ ...validDebt, currentAmount: -10 }],
      })
    ).rejects.toThrow();
  });

  it('rejects interestRate over 100', async () => {
    jest.resetModules();
    setupValidationMocks({
      recommendedStrategy: 'avalanche',
      strategyReasoning: '',
      payoffOrder: [{ debtName: 'Debt', priority: 1 }],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({
        debts: [{ ...validDebt, interestRate: 150 }],
      })
    ).rejects.toThrow();
  });

  it('rejects negative payoff order priority', async () => {
    jest.resetModules();
    setupValidationMocks({
      recommendedStrategy: 'avalanche',
      strategyReasoning: '',
      payoffOrder: [{ debtName: 'Debt', priority: -1 }],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({ debts: [validDebt] })
    ).rejects.toThrow();
  });
});
