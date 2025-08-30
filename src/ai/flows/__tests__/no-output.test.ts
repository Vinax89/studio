function setupNoOutputMocks() {
  const definePromptMock = jest.fn().mockReturnValue(async () => ({ output: undefined }));
  const defineFlowMock = jest.fn(
    (_config: unknown, handler: (...args: unknown[]) => unknown) => handler
  );
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
}

describe('calculateCashflowFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    setupNoOutputMocks();
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({
        annualIncome: 50000,
        estimatedAnnualTaxes: 10000,
        totalMonthlyDeductions: 2000,
      })
    ).rejects.toThrow('No output returned from calculateCashflowFlow');
  });
});

describe('suggestDebtStrategyFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    setupNoOutputMocks();
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({ debts: [] })
    ).rejects.toThrow('No output returned from suggestDebtStrategyFlow');
  });
});

describe('analyzeSpendingHabitsFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    setupNoOutputMocks();
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({ financialDocuments: [], userDescription: '', goals: [] })
    ).rejects.toThrow('No output returned from analyzeSpendingHabitsPrompt');
  });
});

describe('spendingForecastFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    setupNoOutputMocks();
    const { predictSpending } = await import('@/ai/flows/spendingForecast');
    await expect(
      predictSpending({ transactions: [] })
    ).rejects.toThrow('No output returned from spendingForecastPrompt');
  });
});

