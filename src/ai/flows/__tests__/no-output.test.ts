import type { ZodType } from 'zod';

interface FlowConfig<I, O> {
  name: string;
  inputSchema: ZodType<I>;
  outputSchema: ZodType<O>;
}

type FlowHandler<I, O> = (input: I) => Promise<O>;

function setupNoOutputMocks() {
  const redactMock = jest.fn(<I>(input: I) => input);
  const definePromptMock = jest.fn().mockReturnValue(async (input: unknown) => {
    redactMock(input);
    return { output: undefined };
  });
  const defineFlowMock = jest.fn(
    <I, O>(_config: FlowConfig<I, O>, handler: FlowHandler<I, O>) => handler
  );
  jest.doMock('@/ai/genkit', () => ({
    ai: {
      definePrompt: definePromptMock,
      defineFlow: defineFlowMock,
      redact: redactMock,
    },
  }));
  return { definePromptMock, defineFlowMock, redactMock };
}

describe('calculateCashflowFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    const { redactMock } = setupNoOutputMocks();
    const input = {
      annualIncome: 50000,
      estimatedAnnualTaxes: 10000,
      totalMonthlyDeductions: 2000,
    };
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(calculateCashflow(input)).rejects.toThrow(/No output returned/);
    expect(redactMock).toHaveBeenCalledWith(input);
  });
});

describe('suggestDebtStrategyFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    const { redactMock } = setupNoOutputMocks();
    const input = { debts: [] };
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(suggestDebtStrategy(input)).rejects.toThrow(/No output returned/);
    expect(redactMock).toHaveBeenCalledWith(input);
  });
});

describe('suggestCategoryFlow', () => {
  it('throws an error when prompt returns no output', async () => {
    jest.resetModules();
    const { redactMock } = setupNoOutputMocks();
    const input = { description: 'Coffee shop latte' };
    const { suggestCategory } = await import('@/ai/flows/suggest-category');
    await expect(suggestCategory(input)).rejects.toThrow(/No output returned/);
    expect(redactMock).toHaveBeenCalledWith(input);
  });
});

