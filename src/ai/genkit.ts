import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const model = process.env.GENKIT_MODEL || 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model,
});

// Regular expressions for redacting sensitive information
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}/g;
// Matches sequences of 8 or more digits, optionally separated by spaces or dashes
const ACCOUNT_REGEX = /\b(?:\d[ -]?){8,}\b/g;

function redactString(value: string): string {
  return value
    .replace(EMAIL_REGEX, '[EMAIL]')
    .replace(PHONE_REGEX, '[PHONE]')
    .replace(ACCOUNT_REGEX, '[ACCOUNT]');
}

/**
 * Recursively redacts sensitive information from strings, arrays, and objects.
 *
 * @param value - The value to sanitize.
 * @returns A redacted clone of the provided value.
 */
export function redact<T>(value: T): T {
  if (typeof value === 'string') {
    return redactString(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(item => redact(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = redact(val);
    }
    return result as T;
  }
  return value;
}
