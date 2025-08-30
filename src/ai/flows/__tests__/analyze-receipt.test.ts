jest.mock('@/ai/genkit', () => ({
  ai: {
    definePrompt: jest.fn(),
    defineFlow: jest.fn(),
  },
}));

import { AnalyzeReceiptInputSchema } from '@/ai/flows/analyze-receipt';

describe('AnalyzeReceiptInputSchema', () => {
  it('rejects data URIs larger than 1MB', () => {
    const oversizedBuffer = Buffer.alloc(1024 * 1024 + 1);
    const dataUri = `data:image/png;base64,${oversizedBuffer.toString('base64')}`;
    const result = AnalyzeReceiptInputSchema.safeParse({ receiptImage: dataUri });
    expect(result.success).toBe(false);
  });

  it('accepts data URIs up to 1MB', () => {
    const validBuffer = Buffer.alloc(1024 * 1024);
    const dataUri = `data:image/png;base64,${validBuffer.toString('base64')}`;
    const result = AnalyzeReceiptInputSchema.safeParse({ receiptImage: dataUri });
    expect(result.success).toBe(true);
  });
});
