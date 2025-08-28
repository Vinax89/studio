function setupValidationMocks() {
  const promptMock = jest.fn();
  const definePromptMock = jest.fn().mockReturnValue(promptMock);
  const defineFlowMock = jest.fn((_config: any, handler: any) => handler);
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
  return { promptMock };
}

describe('analyzeReceiptFlow validation', () => {
  it('rejects invalid data URI', async () => {
    jest.resetModules();
    const { promptMock } = setupValidationMocks();
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: 'invalid-data' })
    ).rejects.toThrow('Invalid data URI format');
    expect(promptMock).not.toHaveBeenCalled();
  });

  it('rejects oversized payload', async () => {
    jest.resetModules();
    const { promptMock } = setupValidationMocks();
    const largeData = Buffer.from('a'.repeat(5 * 1024 * 1024 + 1)).toString('base64');
    const largeUri = `data:image/png;base64,${largeData}`;
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: largeUri })
    ).rejects.toThrow('Encoded data must be <= 5242880 bytes');
    expect(promptMock).not.toHaveBeenCalled();
  });
});

describe('analyzeSpendingHabitsFlow validation', () => {
  const baseInput = { userDescription: 'desc', goals: [] as any[] };

  it('rejects invalid data URI', async () => {
    jest.resetModules();
    const { promptMock } = setupValidationMocks();
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({ ...baseInput, financialDocuments: ['invalid'] })
    ).rejects.toThrow('Invalid data URI format');
    expect(promptMock).not.toHaveBeenCalled();
  });

  it('rejects oversized payload', async () => {
    jest.resetModules();
    const { promptMock } = setupValidationMocks();
    const largeData = Buffer.from('a'.repeat(5 * 1024 * 1024 + 1)).toString('base64');
    const largeUri = `data:application/pdf;base64,${largeData}`;
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({ ...baseInput, financialDocuments: [largeUri] })
    ).rejects.toThrow('Encoded data must be <= 5242880 bytes');
    expect(promptMock).not.toHaveBeenCalled();
  });
});

