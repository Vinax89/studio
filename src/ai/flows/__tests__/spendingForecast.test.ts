vi.mock('@/ai/genkit', () => ({ ai: { definePrompt: vi.fn(), defineFlow: vi.fn() } }));

import { SpendingForecastInputSchema, SpendingForecastOutputSchema } from '../spendingForecast';

describe('SpendingForecast schemas', () => {
  it('accepts valid date and month formats', () => {
    expect(() =>
      SpendingForecastInputSchema.parse({
        transactions: [
          { date: '2024-01-01', amount: 100, category: 'Misc' },
        ],
      })
    ).not.toThrow();

    expect(() =>
      SpendingForecastOutputSchema.parse({
        forecast: [{ month: '2024-08', amount: 200 }],
        analysis: 'ok',
      })
    ).not.toThrow();
  });

  it.each(['2024/01', '2024-1', '01-2024'])(
    'rejects invalid month %s',
    month => {
      expect(() =>
        SpendingForecastOutputSchema.parse({
          forecast: [{ month, amount: 200 }],
          analysis: 'x',
        })
      ).toThrow();
    }
  );

  it.each(['20240101', '2024/01/01', '01-01-2024'])(
    'rejects invalid date %s',
    date => {
      expect(() =>
        SpendingForecastInputSchema.parse({
          transactions: [
            { date, amount: 100, category: 'Misc' },
          ],
        })
      ).toThrow();
    }
  );
});
