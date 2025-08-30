jest.mock('genkit', () => ({ genkit: () => ({}) }), { virtual: true });
jest.mock('@genkit-ai/googleai', () => ({ googleAI: () => ({}) }), { virtual: true });
import { redact } from '@/ai/genkit';

describe('redact', () => {
  it('masks emails, phone numbers, and account identifiers in strings', () => {
    const input = 'Contact john.doe@example.com or call 123-456-7890 for account 1234-5678-9012.';
    const expected = 'Contact [EMAIL] or call [PHONE] for account [ACCOUNT].';
    expect(redact(input)).toBe(expected);
  });

  it('recursively redacts fields in objects', () => {
    const input = {
      email: 'a@b.com',
      phone: '(123)456-7890',
      nested: { note: 'acct 987654321' },
    };
    expect(redact(input)).toEqual({
      email: '[EMAIL]',
      phone: '[PHONE]',
      nested: { note: 'acct [ACCOUNT]' },
    });
  });
});
