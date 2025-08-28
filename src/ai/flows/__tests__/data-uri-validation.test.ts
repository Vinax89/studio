function setupAnalyzeReceiptMocks() {
  const definePromptMock = jest
    .fn()
    .mockReturnValue(async () => ({
      output: { description: 'desc', amount: 1, category: 'cat' },
    }));
  const defineFlowMock = jest.fn((config: any, handler: any) => async (input: any) => {
    const parsed = config.inputSchema.parse(input);
    return handler(parsed);
  });
  jest.doMock('@/ai/genkit', () => ({
    ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock },
  }));
}

function setupAnalyzeSpendingMocks() {
  const definePromptMock = jest
    .fn()
    .mockReturnValue(async () => ({
      output: {
        spendingAnalysis: 'analysis',
        savingsOpportunities: 'savings',
        recommendations: 'recommendations',
      },
    }));
  const defineFlowMock = jest.fn((config: any, handler: any) => async (input: any) => {
    const parsed = config.inputSchema.parse(input);
    return handler(parsed);
  });
  jest.doMock('@/ai/genkit', () => ({
    ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock },
  }));
}

describe('AnalyzeReceiptInputSchema', () => {
  beforeEach(() => {
    jest.resetModules();
    setupAnalyzeReceiptMocks();
  });

  it('accepts valid data URI', async () => {
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: 'data:image/png;base64,AAA=' })
    ).resolves.toEqual({ description: 'desc', amount: 1, category: 'cat' });
  });

  it('rejects invalid data URI', async () => {
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: 'not-a-data-uri' })
    ).rejects.toThrow();
  });
});

describe('AnalyzeSpendingHabitsInputSchema', () => {
  const baseInput = {
    userDescription: 'desc',
    goals: [
      {
        id: '1',
        name: 'Goal',
        targetAmount: 100,
        currentAmount: 10,
        deadline: '2025-01-01',
        importance: 3,
      },
    ],
  };

  beforeEach(() => {
    jest.resetModules();
    setupAnalyzeSpendingMocks();
  });

  it('accepts valid data URI', async () => {
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({
        financialDocuments: ['data:application/pdf;base64,AAA='],
        ...baseInput,
      })
    ).resolves.toEqual({
      spendingAnalysis: 'analysis',
      savingsOpportunities: 'savings',
      recommendations: 'recommendations',
    });
  });

  it('rejects invalid data URI', async () => {
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({
        financialDocuments: ['not-a-data-uri'],
        ...baseInput,
      })
    ).rejects.toThrow();
  });
});

