import { genkit, type ModelMiddleware } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import crypto from 'crypto';

/**
 * Regex patterns for detecting common forms of PII.
 */
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g;
// Rough pattern for long sequences of digits such as account numbers or cards.
const ACCOUNT_REGEX = /\b\d{12,19}\b/g;

function hash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Middleware that hashes sensitive information in request messages
 * before they are sent to the model.
 */
export const piiMiddleware: ModelMiddleware = async (req, next) => {
  const messages = req.messages.map((message) => ({
    ...message,
    content: message.content.map((part) => {
      if (part.text) {
        const text = part.text
          .replace(EMAIL_REGEX, (m) => hash(m))
          .replace(PHONE_REGEX, (m) => hash(m))
          .replace(ACCOUNT_REGEX, (m) => hash(m));
        return { ...part, text };
      }
      return part;
    }),
  }));

  return next({ ...req, messages });
};

const model = process.env.GENKIT_MODEL || 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model,
});

export { piiMiddleware };
