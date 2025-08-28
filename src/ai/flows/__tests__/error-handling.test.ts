function setupErrorMocks() {
  const definePromptMock = jest
    .fn()
    .mockReturnValue(async () => {
      throw new Error('prompt failure');
    });
  const defineFlowMock = jest.fn((_config: any, handler: any) => handler);
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
}

describe('calculateCashflowFlow', () => {
  it('returns an error object when prompt throws', async () => {
    jest.resetModules();
    setupErrorMocks();
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({
        annualIncome: 50000,
        estimatedAnnualTaxes: 10000,
        totalMonthlyDeductions: 2000,
      })
    ).resolves.toEqual({ error: 'Unable to calculate cashflow. Please try again later.' });
  });
});

describe('suggestDebtStrategyFlow', () => {
  it('returns an error object when prompt throws', async () => {
    jest.resetModules();
    setupErrorMocks();
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(suggestDebtStrategy({ debts: [] })).resolves.toEqual({
      error: 'Unable to suggest debt strategy. Please try again later.',
    });
  });
});

describe('taxEstimationFlow', () => {
  it('returns an error object when prompt throws', async () => {
    jest.resetModules();
    setupErrorMocks();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({
        income: 50000,
        deductions: 10000,
        location: 'NY',
        filingStatus: 'single',
      })
    ).resolves.toEqual({ error: 'Unable to estimate tax. Please try again later.' });
  });
});

describe('analyzeReceiptFlow', () => {
  it('returns an error object when prompt throws', async () => {
    jest.resetModules();
    setupErrorMocks();
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: 'data:image/png;base64,abcd' })
    ).resolves.toEqual({ error: 'Unable to analyze receipt. Please try again later.' });
  });
});

describe('analyzeSpendingHabitsFlow', () => {
  it('returns an error object when prompt throws', async () => {
    jest.resetModules();
    setupErrorMocks();
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({
        financialDocuments: ['data:application/pdf;base64,abcd'],
        userDescription: 'desc',
        goals: [
          {
            id: '1',
            name: 'goal',
            targetAmount: 1000,
            currentAmount: 100,
            deadline: '2024-12-31',
            importance: 3,
          },
        ],
      })
    ).resolves.toEqual({
      error: 'Unable to analyze spending habits. Please try again later.',
    });
  });
});

describe('spendingForecastFlow', () => {
  it('returns an error object when prompt throws', async () => {
    jest.resetModules();
    setupErrorMocks();
    const { predictSpending } = await import('@/ai/flows/spendingForecast');
    await expect(
      predictSpending({
        transactions: [
          { date: '2024-01-01', amount: 100, category: 'food', description: 'lunch' },
        ],
      })
    ).resolves.toEqual({
      error: 'Unable to generate spending forecast. Please try again later.',
    });
  });
});
