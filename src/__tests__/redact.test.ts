import { redactMiddleware } from '@/ai/redact';

describe('redactMiddleware', () => {
  const run = async (text: string) => {
    const req: any = {
      messages: [{ role: 'user', content: [{ text }] }],
    };
    const next = jest.fn(async (r) => r);
    await redactMiddleware(req, next);
    return next.mock.calls[0][0].messages[0].content[0].text;
  };

  it('removes email addresses', async () => {
    const result = await run('Contact me at test@example.com');
    expect(result).not.toContain('test@example.com');
  });

  it('removes phone numbers', async () => {
    const result = await run('Call me at (555) 123-4567');
    expect(result).not.toContain('555');
    expect(result).not.toContain('123-4567');
  });

  it('removes account identifiers', async () => {
    const result = await run('My account id is acct_ABC123');
    expect(result).not.toContain('acct_ABC123');
  });
});
