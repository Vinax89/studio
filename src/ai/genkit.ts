import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const model = process.env.GENKIT_MODEL || 'googleai/gemini-2.5-flash';

/**
 * Matches 12–19 digit sequences typically used for credit card numbers.
 * Shorter or longer sequences are left untouched to reduce false positives.
 */
const creditCardPattern = /\b\d{12,19}\b/g;

/**
 * Performs a Luhn checksum to validate potential credit card numbers.
 */
function luhnCheck(num: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Redacts recognized account numbers from text.
 * Only sequences passing the Luhn check are sanitized as credit cards to avoid false positives.
 */
export function sanitizePII(text: string): string {
  return text.replace(creditCardPattern, (match) =>
    luhnCheck(match) ? '[REDACTED]' : match
  );
}

export const ai = genkit({
  plugins: [googleAI()],
  model,
});
