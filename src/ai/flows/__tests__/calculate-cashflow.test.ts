function setupMocks(mockOutput: any) {
  const definePromptMock = jest.fn().mockImplementation(({ input, output }) => {
    return async (inputData: any) => {
      input.schema.parse(inputData);
      const parsed = output.schema.parse(mockOutput);
      return { output: parsed };
    };
  });
  const defineFlowMock = jest.fn((_config: any, handler: any) => handler);
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
}

describe('calculateCashflowFlow', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('resolves with expected data', async () => {
    const mockOutput = {
      grossMonthlyIncome: 5000,
      netMonthlyIncome: 3500,
      analysis: 'You have a healthy surplus.',
    };
    setupMocks(mockOutput);
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({
        annualIncome: 60000,
        estimatedAnnualTaxes: 12000,
        totalMonthlyDeductions: 1500,
      })
    ).resolves.toEqual(mockOutput);
  });

  it('throws a validation error for mismatched fields', async () => {
    const invalidOutput = {
      grossMonthlyIncome: '5000', // should be number
      netMonthlyIncome: 3500,
      analysis: 'Invalid data',
    } as any;
    setupMocks(invalidOutput);
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({
        annualIncome: 60000,
        estimatedAnnualTaxes: 12000,
        totalMonthlyDeductions: 1500,
      })
    ).rejects.toThrow();
  });
});

