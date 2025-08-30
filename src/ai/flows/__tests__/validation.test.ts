import type { Region } from '@/data/costOfLiving2024';

interface Schema<T = unknown> {
  parse: (value: unknown) => T;
}

interface FlowConfig<I = unknown, O = unknown> {
  inputSchema: Schema<I>;
  outputSchema: Schema<O>;
}

type FlowHandler<I = unknown, O = unknown> = (input: I) => O | Promise<O>;

function setupSuccessMocks<O>(output: O) {
  const definePromptMock = jest.fn().mockReturnValue(async () => ({ output }));
  const defineFlowMock = jest.fn(<I>(config: FlowConfig<I, O>, handler: FlowHandler<I, O>) => {
    return async (input: unknown): Promise<O> => {
      const parsedInput = config.inputSchema.parse(input);
      const result = await handler(parsedInput);
      return config.outputSchema.parse(result);
    };
  });
  jest.doMock('@/ai/genkit', () => ({ ai: { definePrompt: definePromptMock, defineFlow: defineFlowMock } }));
}

describe('calculateCashflow validation', () => {
  it('rejects negative annual income', async () => {
    jest.resetModules();
    setupSuccessMocks({ grossMonthlyIncome: 0, netMonthlyIncome: 0, analysis: '' });
    const { calculateCashflow } = await import('@/ai/flows/calculate-cashflow');
    await expect(
      calculateCashflow({ annualIncome: -1, estimatedAnnualTaxes: 0, totalMonthlyDeductions: 0 })
    ).rejects.toThrow();
  });
});

describe('taxEstimation validation', () => {
  it('rejects negative income', async () => {
    jest.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    await expect(
      estimateTax({ income: -1, deductions: 0, location: 'NY', filingStatus: 'single' })
    ).rejects.toThrow();
  });

  it('calculates tax using 2025 brackets', async () => {
    jest.resetModules();
    const { estimateTax } = await import('@/ai/flows/tax-estimation');
    const result = await estimateTax({
      income: 80000,
      deductions: 0,
      location: 'NY',
      filingStatus: 'single',
    });
    expect(result.estimatedTax).toBeCloseTo(15334, 0);
    expect(result.taxRate).toBeCloseTo(19.17, 2);
  });
});

describe('suggestDebtStrategy validation', () => {
  it('rejects interest rate over 100', async () => {
    jest.resetModules();
    setupSuccessMocks({
      recommendedStrategy: 'snowball',
      strategyReasoning: '',
      payoffOrder: [],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({
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
      })
    ).rejects.toThrow();
  });

  it('rejects payoff order priority less than 1', async () => {
    jest.resetModules();
    setupSuccessMocks({
      recommendedStrategy: 'snowball',
      strategyReasoning: '',
      payoffOrder: [{ debtName: 'Card', priority: 0 }],
      summary: '',
    });
    const { suggestDebtStrategy } = await import('@/ai/flows/suggest-debt-strategy');
    await expect(
      suggestDebtStrategy({ debts: [] })
    ).rejects.toThrow();
  });
});

describe('calculateCostOfLiving validation', () => {
  it('rejects non-positive adult count', async () => {
    const { calculateCostOfLiving } = await import('@/ai/flows/cost-of-living');
    expect(() =>
      calculateCostOfLiving({ region: 'California', adults: 0, children: 0 })
    ).toThrow();
  });

  it('rejects unknown region', async () => {
    const { calculateCostOfLiving } = await import('@/ai/flows/cost-of-living');
    expect(() =>
      calculateCostOfLiving({
        region: 'Atlantis' as unknown as Region,
        adults: 1,
        children: 0,
      })
    ).toThrow('Unknown region');
  });
});

