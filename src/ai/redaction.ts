import { type ModelMiddleware } from '@genkit-ai/ai/model';

/**
 * Redact sensitive information from a string.
 * Removes email addresses, phone numbers, and long account numbers.
 */
export function redactText(value: string): string {
  return value
    // Emails
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED]')
    // Phone numbers (e.g., 123-456-7890, (123) 456-7890, +1 123 456 7890)
    .replace(/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?){2}\d{4}\b/g, '[REDACTED]')
    // Account numbers or long digit sequences (9+ digits)
    .replace(/\b\d{9,}\b/g, '[REDACTED]');
}

/**
 * If the value is a data URI, decode the payload, redact, then re-encode.
 */
function redactDataUri(uri: string): string {
  if (!uri.startsWith('data:')) return redactText(uri);
  const [prefix, data] = uri.split(',', 2);
  try {
    const decoded = Buffer.from(data, 'base64').toString('utf8');
    const redacted = redactText(decoded);
    return `${prefix},${Buffer.from(redacted, 'utf8').toString('base64')}`;
  } catch {
    return redactText(uri);
  }
}

/**
 * Recursively redact all string fields within the provided input.
 */
export function redactInput<T>(input: T): T {
  if (typeof input === 'string') {
    return redactDataUri(input) as unknown as T;
  }
  if (Array.isArray(input)) {
    return input.map((item) => redactInput(item)) as unknown as T;
  }
  if (input && typeof input === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(input as any)) {
      result[key] = redactInput(value);
    }
    return result;
  }
  return input;
}

/**
 * Genkit model middleware to ensure any remaining sensitive data in messages is redacted.
 */
export const redactionMiddleware: ModelMiddleware = async (req, next) => {
  const messages = req.messages.map((message) => ({
    ...message,
    content: message.content.map((part) => {
      if (part.text) {
        return { ...part, text: redactText(part.text) };
      }
      if (part.media?.url) {
        return { ...part, media: { ...part.media, url: redactDataUri(part.media.url) } };
      }
      return part;
    }),
  }));
  return next({ ...req, messages });
};

export default redactInput;
