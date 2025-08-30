jest.mock('genkit', () => ({ genkit: jest.fn(() => ({})) }));
jest.mock(
  '@genkit-ai/googleai',
  () => {
    const model = jest.fn((_name: string, opts: any) => ({ name: _name, ...opts }));
    const plugin = jest.fn();
    return { googleAI: Object.assign(plugin, { model }) };
  },
  { virtual: true }
);

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { redactMiddleware } from '@/ai/redact';

describe('genkit client', () => {
  it('injects redaction middleware', () => {
    require('@/ai/genkit');
    expect((googleAI as any).model).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ use: [redactMiddleware] })
    );
    expect((genkit as any).mock.calls[0][0]).toBeDefined();
  });
});
