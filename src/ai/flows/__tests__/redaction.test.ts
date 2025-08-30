import type { ZodType } from 'zod';

interface FlowConfig<I, O> {
  name: string;
  inputSchema: ZodType<I>;
  outputSchema: ZodType<O>;
}

type FlowHandler<I, O> = (input: I) => Promise<O>;

function setupRedactionMocks<O>(output: O) {
  let captured: any = null;
  const promptFn = jest.fn(async (input: any) => {
    captured = input;
    return { output };
  });
  const definePromptMock = jest.fn().mockReturnValue(promptFn);
  const defineFlowMock = jest.fn(<I>(config: FlowConfig<I, O>, handler: FlowHandler<I, O>) => {
    return async (input: I) => handler(config.inputSchema.parse(input));
  });
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
  return { promptFn, getCaptured: () => captured };
}

describe('redaction utility in flows', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('redacts sensitive text in suggestCategory before model call', async () => {
    const { getCaptured } = setupRedactionMocks({ category: 'Food' });
    const { suggestCategory } = await import('@/ai/flows/suggest-category');
    await suggestCategory({
      description: 'Dinner with john.doe@example.com call 555-123-4567 account 1234567890123456',
    });
    const called = getCaptured().description;
    expect(called).not.toMatch(/john\.doe@example\.com/);
    expect(called).not.toMatch(/555-123-4567/);
    expect(called).not.toMatch(/1234567890123456/);
  });

  it('redacts sensitive data in analyzeReceipt before model call', async () => {
    const { getCaptured } = setupRedactionMocks({ description: '', amount: 0, category: '' });
    const { analyzeReceipt } = await import('@/ai/flows/analyze-receipt');
    const sensitive = 'Email john@example.com phone 800-555-1212 account 1234567890123';
    const base64 = Buffer.from(sensitive, 'utf8').toString('base64');
    await analyzeReceipt({ receiptImage: `data:text/plain;base64,${base64}` });
    const called = getCaptured().receiptImage;
    expect(called).not.toMatch(/john@example.com/);
    expect(called).not.toMatch(/800-555-1212/);
    expect(called).not.toMatch(/1234567890123/);
  });
});
