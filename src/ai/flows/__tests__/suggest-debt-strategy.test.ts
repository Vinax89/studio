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

describe('suggestDebtStrategyFlow', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const sampleInput = {
    debts: [
      {
        id: '1',
        name: 'Loan A',
        initialAmount: 1000,
        currentAmount: 900,
        interestRate: 5,
        minimumPayment: 50,
        dueDate: '2023-12-01',
        recurrence: 'monthly',
      },
    ],
  } as const;

  it('resolves with expected data', async () => {
    const mockOutput = {
      recommendedStrategy: 'avalanche',
      strategyReasoning: 'Highest interest first saves more money.',
      payoffOrder: [{ debtName: 'Loan A', priority: 1 }],
      summary: 'You can do it!',
    };
    setupMocks(mockOutput);
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(suggestDebtStrategy(sampleInput)).resolves.toEqual(mockOutput);
  });

  it('throws a validation error for mismatched fields', async () => {
    const invalidOutput = {
      recommendedStrategy: 'avalanche',
      strategyReasoning: 'Highest interest first saves more money.',
      payoffOrder: [{ debtName: 'Loan A', priority: '1' }], // priority should be number
      summary: 'You can do it!',
    } as any;
    setupMocks(invalidOutput);
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(suggestDebtStrategy(sampleInput)).rejects.toThrow();
  });
});

