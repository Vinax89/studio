function setupNoOutputMocks() {
  const definePromptMock = jest.fn().mockReturnValue(async () => ({ output: undefined }));
  const defineFlowMock = jest.fn((_config: any, handler: any) => handler);
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

describe('taxEstimation', () => {
  it('returns deterministic output', async () => {
    jest.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    const result = await estimateTax({
      income: 50000,
      deductions: 10000,
      state: 'CA',
      filingStatus: 'single',
    });
    expect(result.estimatedTax).toBeGreaterThan(0);
  });
});
