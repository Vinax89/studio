import { parseCsv } from '@/lib/csv';

describe('parseCsv', () => {
  it('parses valid CSV files', async () => {
    const csv = 'a,b\n1,2\n3,4';
    const file = new File([csv], 'test.csv', { type: 'text/csv' });

    const result = await parseCsv<{ a: number; b: number }>(file);

    expect(result).toEqual([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
  });

  it('aggregates errors into a single message', async () => {
    const csv = 'a,b\n1\n2,3,4';
    const file = new File([csv], 'test.csv', { type: 'text/csv' });

    await expect(parseCsv(file)).rejects.toThrow(
      'Too few fields: expected 2 fields but parsed 1, Too many fields: expected 2 fields but parsed 3',
    );
  });
});

