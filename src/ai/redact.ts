import type { ModelMiddleware } from '@genkit-ai/ai/model';
import { genkitPlugin } from 'genkit';

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const ACCOUNT_REGEX = /(account|acct|iban|routing|ssn)[^\d]{0,10}\d{2,}/gi;

export function redactText(text: string): string {
  return text
    .replace(EMAIL_REGEX, '[REDACTED]')
    .replace(PHONE_REGEX, '[REDACTED]')
    .replace(ACCOUNT_REGEX, '[REDACTED]');
}

export function redact<T>(data: T): T {
  if (typeof data === 'string') {
    return redactText(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => redact(item)) as unknown as T;
  }
  if (data && typeof data === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      result[key] = redact(value);
    }
    return result as T;
  }
  return data;
}

export const redactMiddleware: ModelMiddleware = async (req, next) => {
  const messages = req.messages.map(m => ({
    ...m,
    content: m.content.map(part =>
      part.text ? { ...part, text: redactText(part.text) } : part
    ),
  }));
  const res = await next({ ...req, messages });
  if (res.candidates) {
    return {
      ...res,
      candidates: res.candidates.map(c => ({
        ...c,
        content: c.content.map(part =>
          part.text ? { ...part, text: redactText(part.text) } : part
        ),
      })),
    };
  }
  return res;
};

export function redactionPlugin() {
  return genkitPlugin('redaction', () => {});
}
