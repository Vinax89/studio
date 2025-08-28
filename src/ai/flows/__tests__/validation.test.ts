function setupSuccessMocks(output: any) {
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
  it('rejects negative annual income', async () => {
    jest.resetModules();
    setupSuccessMocks({ grossMonthlyIncome: 0, netMonthlyIncome: 0, analysis: '' });
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({ annualIncome: -1, estimatedAnnualTaxes: 0, totalMonthlyDeductions: 0 })
    ).rejects.toThrow();
  });
});

describe('taxEstimation validation', () => {
  it('rejects negative income', async () => {
    jest.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({ income: -1, state: 'NY', filingStatus: 'single' })
    ).rejects.toThrow();
  });

  it('calculates tax using 2025 brackets', async () => {
    jest.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    const result = await estimateTax({
      income: 80000,
      state: 'NY',
      filingStatus: 'single',
    });
    expect(result.estimatedTax).toBeCloseTo(13276.82, 2);
    expect(result.taxRate).toBeCloseTo(16.6, 2);
  });
});

describe('suggestDebtStrategy validation', () => {
  it('rejects interest rate over 100', async () => {
    jest.resetModules();
    setupSuccessMocks({
      recommendedStrategy: 'snowball',
      strategyReasoning: '',
      payoffOrder: [],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({
        debts: [
          {
            id: '1',
            name: 'Card',
            initialAmount: 1000,
            currentAmount: 1000,
            interestRate: 150,
            minimumPayment: 50,
            dueDate: '2024-01-01',
            recurrence: 'monthly',
          },
        ],
      })
    ).rejects.toThrow();
  });

  it('rejects payoff order priority less than 1', async () => {
    jest.resetModules();
    setupSuccessMocks({
      recommendedStrategy: 'snowball',
      strategyReasoning: '',
      payoffOrder: [{ debtName: 'Card', priority: 0 }],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({ debts: [] })
    ).rejects.toThrow();
  });
});
