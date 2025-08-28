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

describe('taxEstimationFlow', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const sampleInput = {
    income: 50000,
    deductions: 10000,
    location: 'NY',
    filingStatus: 'single',
  } as const;

  it('resolves with expected data', async () => {
    const mockOutput = {
      estimatedTax: 8000,
      taxRate: 0.16,
      breakdown: 'Detailed breakdown.',
    };
    setupMocks(mockOutput);
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(estimateTax(sampleInput)).resolves.toEqual(mockOutput);
  });

  it('throws a validation error for mismatched fields', async () => {
    const invalidOutput = {
      estimatedTax: '8000', // should be number
      taxRate: 0.16,
      breakdown: 'Detailed breakdown.',
    } as any;
    setupMocks(invalidOutput);
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(estimateTax(sampleInput)).rejects.toThrow();
  });
});

