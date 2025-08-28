function setupOutputMocks(output: any) {
  const definePromptMock = jest.fn().mockReturnValue(async () => ({ output }));
  const defineFlowMock = jest.fn((_config: any, handler: any) => handler);
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
  return { definePromptMock, defineFlowMock };
}

describe('calculateCashflowFlow', () => {
  it('returns expected output shape', async () => {
    jest.resetModules();
    const mockOutput = {
      grossMonthlyIncome: 5000,
      netMonthlyIncome: 3000,
      analysis: 'surplus',
    };
    setupOutputMocks(mockOutput);
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({
        annualIncome: 60000,
        estimatedAnnualTaxes: 12000,
        totalMonthlyDeductions: 1000,
      })
    ).resolves.toEqual(mockOutput);
  });
});

describe('suggestDebtStrategyFlow', () => {
  it('returns expected output shape', async () => {
    jest.resetModules();
    const mockOutput = {
      recommendedStrategy: 'avalanche',
      strategyReasoning: 'because',
      payoffOrder: [{ debtName: 'Loan', priority: 1 }],
      summary: 'summary',
    };
    setupOutputMocks(mockOutput);
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({ debts: [] })
    ).resolves.toEqual(mockOutput);
  });
});

describe('taxEstimationFlow', () => {
  it('returns expected output shape', async () => {
    jest.resetModules();
    const mockOutput = {
      estimatedTax: 5000,
      taxRate: 20,
      breakdown: 'details',
    };
    setupOutputMocks(mockOutput);
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({
        income: 50000,
        deductions: 10000,
        location: 'NY',
        filingStatus: 'single',
      })
    ).resolves.toEqual(mockOutput);
  });
});

describe('analyzeReceiptFlow', () => {
  it('returns expected output shape', async () => {
    jest.resetModules();
    const mockOutput = {
      description: 'Vendor',
      amount: 12.34,
      category: 'Food',
    };
    setupOutputMocks(mockOutput);
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: 'data:image/png;base64,abc' })
    ).resolves.toEqual(mockOutput);
  });
});

describe('analyzeSpendingHabitsFlow', () => {
  it('returns expected output shape', async () => {
    jest.resetModules();
    const mockOutput = {
      spendingAnalysis: 'analysis',
      savingsOpportunities: 'savings',
      recommendations: 'recs',
    };
    setupOutputMocks(mockOutput);
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({
        financialDocuments: ['data:application/pdf;base64,abc'],
        userDescription: 'test',
        goals: [
          {
            id: '1',
            name: 'Save',
            targetAmount: 1000,
            currentAmount: 100,
            deadline: '2024-12-31',
            importance: 5,
          },
        ],
      })
    ).resolves.toEqual(mockOutput);
  });
});

describe('spendingForecastFlow', () => {
  it('returns expected output shape', async () => {
    jest.resetModules();
    const mockOutput = {
      forecast: [{ month: '2024-08', amount: 300 }],
      analysis: 'trend',
    };
    setupOutputMocks(mockOutput);
    const { predictSpending } = await import('@/ai/flows/spendingForecast');
    await expect(
      predictSpending({
        transactions: [
          { date: '2024-01-01', amount: 100, category: 'Food' },
        ],
      })
    ).resolves.toEqual(mockOutput);
  });
});
