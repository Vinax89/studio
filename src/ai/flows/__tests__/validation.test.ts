import type { MetroArea } from '@/data/costOfLiving2024';

interface Schema<T = unknown> {
  parse: (value: unknown) => T;
}

interface FlowConfig<I = unknown, O = unknown> {
  inputSchema: Schema<I>;
  outputSchema: Schema<O>;
}

type FlowHandler<I = unknown, O = unknown> = (input: I) => O | Promise<O>;

function setupSuccessMocks<O>(output: O) {
  const redactMock = vi.fn(<I>(input: I) => input);
  const definePromptMock = vi
    .fn()
    .mockReturnValue(async (input: unknown) => {
      redactMock(input);
      return { output };
    });
  const defineFlowMock = vi.fn(<I>(config: FlowConfig<I, O>, handler: FlowHandler<I, O>) => {
    return async (input: unknown): Promise<O> => {
      const parsedInput = config.inputSchema.parse(input);
      const result = await handler(parsedInput);
      return config.outputSchema.parse(result);
    };
  });
  vi.doMock('@/ai/genkit', () => ({
    ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock, redact: redactMock },
  }));
  return { definePromptMock, defineFlowMock, redactMock };
}

describe('calculateCashflow validation', () => {
  it('rejects negative annual income', async () => {
    vi.resetModules();
    const { redactMock } = setupSuccessMocks({ grossMonthlyIncome: 0, netMonthlyIncome: 0, analysis: '' });
    const input = { annualIncome: -1, estimatedAnnualTaxes: 0, totalMonthlyDeductions: 0 };
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(calculateCashflow(input)).rejects.toThrow();
    expect(redactMock).not.toHaveBeenCalled();
  });
});

describe('taxEstimation validation', () => {
  it('rejects negative income', async () => {
    vi.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({ income: -1, deductions: 0, location: 'NY', filingStatus: 'single' })
    ).rejects.toThrow();
  });

  it('calculates tax using 2025 brackets', async () => {
    vi.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    const result = await estimateTax({
      income: 80000,
      deductions: 0,
      location: 'NY',
      filingStatus: 'single',
    });
    expect(result.estimatedTax).toBeCloseTo(9214, 0);
    expect(result.taxRate).toBeCloseTo(11.52, 2);
  });
});

describe('suggestDebtStrategy validation', () => {
  it('rejects interest rate over 100', async () => {
    vi.resetModules();
    const { redactMock } = setupSuccessMocks({
      recommendedStrategy: 'snowball',
      strategyReasoning: '',
      payoffOrder: [],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    const input = {
      debts: [
        {
          id: '1',
          name: 'Card',
          initialAmount: 1000,
          currentAmount: 1000,
          interestRate: 150,
          minimumPayment: 50,
          dueDate: '2024-01-01',
          recurrence: 'monthly',
        },
      ],
    };
    await expect(suggestDebtStrategy(input)).rejects.toThrow();
    expect(redactMock).not.toHaveBeenCalled();
  });

  it('rejects payoff order priority less than 1', async () => {
    vi.resetModules();
    const { redactMock } = setupSuccessMocks({
      recommendedStrategy: 'snowball',
      strategyReasoning: '',
      payoffOrder: [{ debtName: 'Card', priority: 0 }],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    const input = { debts: [] };
    await expect(suggestDebtStrategy(input)).rejects.toThrow();
    expect(redactMock).toHaveBeenCalledWith(input);
  });
});

describe('calculateCostOfLiving validation', () => {
  it('rejects non-positive adult count', async () => {
    const { calculateCostOfLiving } = await import('@/ai/flows/cost-of-living');
    expect(() =>
      calculateCostOfLiving({
        metro: 'Abilene, TX (Metropolitan Statistical Area)',
        adults: 0,
        children: 0,
      })
    ).toThrow();
  });

  it('rejects unknown metro', async () => {
    const { calculateCostOfLiving } = await import('@/ai/flows/cost-of-living');
    expect(() =>
      calculateCostOfLiving({
        metro: 'Atlantis' as unknown as MetroArea,
        adults: 1,
        children: 0,
      })
    ).toThrow('Unknown metro');
  });
});

