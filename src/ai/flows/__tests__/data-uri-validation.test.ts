import { MAX_DATA_URI_SIZE } from '@/ai/flows/utils';

function setupValidationMocks() {
  const promptFn = jest.fn();
  const definePromptMock = jest.fn().mockReturnValue(promptFn);
  const defineFlowMock = jest.fn((_config: any, handler: any) => handler);
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
  return { promptFn };
}

describe('analyzeReceipt input validation', () => {
  it('rejects invalid data URI', async () => {
    jest.resetModules();
    const { promptFn } = setupValidationMocks();
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    await expect(
      analyzeReceipt({ receiptImage: 'not-a-data-uri' })
    ).rejects.toThrow('receiptImage: Invalid data URI format');
    expect(promptFn).not.toHaveBeenCalled();
  });

  it('rejects oversized data URI', async () => {
    jest.resetModules();
    const { promptFn } = setupValidationMocks();
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    const largeBuffer = Buffer.alloc(MAX_DATA_URI_SIZE + 1);
    const largeDataUri = `data:image/png;base64,${largeBuffer.toString('base64')}`;
    await expect(
      analyzeReceipt({ receiptImage: largeDataUri })
    ).rejects.toThrow('receiptImage: Data URI exceeds');
    expect(promptFn).not.toHaveBeenCalled();
  });
});

describe('analyzeSpendingHabits input validation', () => {
  it('rejects invalid data URI', async () => {
    jest.resetModules();
    const { promptFn } = setupValidationMocks();
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    await expect(
      analyzeSpendingHabits({
        financialDocuments: ['not-a-data-uri'],
        userDescription: 'desc',
        goals: [],
      })
    ).rejects.toThrow('financialDocuments.0: Invalid data URI format');
    expect(promptFn).not.toHaveBeenCalled();
  });

  it('rejects oversized data URI', async () => {
    jest.resetModules();
    const { promptFn } = setupValidationMocks();
    const { analyzeSpendingHabits } = await import('@/ai/flows/analyze-spending-habits');
    const largeBuffer = Buffer.alloc(MAX_DATA_URI_SIZE + 1);
    const largeDataUri = `data:application/pdf;base64,${largeBuffer.toString('base64')}`;
    await expect(
      analyzeSpendingHabits({
        financialDocuments: [largeDataUri],
        userDescription: 'desc',
        goals: [],
      })
    ).rejects.toThrow('financialDocuments.0: Data URI exceeds');
    expect(promptFn).not.toHaveBeenCalled();
  });
});
