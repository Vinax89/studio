import type { ModelMiddleware } from '@genkit-ai/ai/model';

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const phoneRegex = /(?:\+?\d{1,2}[\s-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
const accountRegex = /\b(?:acct|account)(?:[\s:_-]*id)?[\s:_-]*[A-Za-z0-9]+\b/gi;

function redactText(text: string): string {
  return text
    .replace(emailRegex, '[REDACTED]')
    .replace(phoneRegex, '[REDACTED]')
    .replace(accountRegex, '[REDACTED]');
}

export const redactMiddleware: ModelMiddleware = async (req, next) => {
  const messages = req.messages.map((message) => ({
    ...message,
    content: message.content.map((part) => {
      if (part.text) {
        return { ...part, text: redactText(part.text) };
      }
      return part;
    }),
  }));

  return next({ ...req, messages });
};

export default redactMiddleware;
