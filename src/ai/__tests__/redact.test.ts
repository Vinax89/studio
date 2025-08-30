import {redactSensitiveMiddleware} from '@/ai/redact';
import type {GenerateRequest, GenerateResponseData} from 'genkit/model';

describe('redactSensitiveMiddleware', () => {
  it('redacts emails, phone numbers, and account digits', async () => {
    const req: GenerateRequest = {
      messages: [
        {
          role: 'user',
          content: [
            {
              text: 'Email: test@example.com Phone: +1 (123) 456-7890 Account: 1234567890123456',
            },
          ],
        },
      ],
    } as any;

    const next = jest.fn(async (_req: GenerateRequest): Promise<GenerateResponseData> => ({
      message: {
        role: 'model',
        content: [
          {
            text: 'Got test@example.com and 123-456-7890 account 6543210987654321',
          },
        ],
      },
    }) as any);

    const res = await redactSensitiveMiddleware(req, next);

    const redactedInput = next.mock.calls[0][0] as GenerateRequest;
    expect(redactedInput.messages[0].content[0].text).toBe(
      'Email: [REDACTED] Phone: [REDACTED] Account: [REDACTED]'
    );

    expect(res.message!.content[0].text).toBe(
      'Got [REDACTED] and [REDACTED] account [REDACTED]'
    );
  });
});
