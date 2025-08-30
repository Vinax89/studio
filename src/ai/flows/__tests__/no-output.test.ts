function setupNoOutputMocks() {
  const definePromptMock = jest.fn().mockReturnValue(async () => ({ output: undefined }));
  const defineFlowMock = jest.fn(
    (_config: unknown, handler: unknown) => handler as unknown
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
    ).rejects.toThrow(/No output returned/);
  });
});

describe('suggestDebtStrategyFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    setupNoOutputMocks();
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(suggestDebtStrategy({ debts: [] })).rejects.toThrow(/No output returned/);
  });
});

describe('suggestCategoryFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    setupNoOutputMocks();
    const { suggestCategory } = await import('@/ai/flows/suggest-category');
    await expect(
      suggestCategory({ description: 'Coffee shop latte' })
    ).rejects.toThrow(/No output returned/);
  });
});

