import type { ModelMiddleware, Part, MessageData, GenerateResponseData } from 'genkit/model';

const REDACTED = '[REDACTED]';

const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_REGEX = /\+?\d[\d\s\-()]{7,}\d/g;
const ACCOUNT_REGEX = /\b\d{8,}\b/g;

function redactText(text: string): string {
  return text
    .replace(EMAIL_REGEX, REDACTED)
    .replace(PHONE_REGEX, REDACTED)
    .replace(ACCOUNT_REGEX, REDACTED);
}

function redactParts(parts: Part[]): Part[] {
  return parts.map(part =>
    part.text ? { ...part, text: redactText(part.text) } : part
  );
}

function redactMessage(message: MessageData): MessageData {
  return { ...message, content: redactParts(message.content) };
}

export const redactSensitiveMiddleware: ModelMiddleware = async (req, next) => {
  const redactedReq = { ...req, messages: req.messages.map(redactMessage) };
  const response = await next(redactedReq);
  const redactedResponse: GenerateResponseData = {
    ...response,
    message: response.message ? redactMessage(response.message) : response.message,
    candidates: response.candidates?.map(candidate => ({
      ...candidate,
      content: redactParts(candidate.content),
    })),
  } as GenerateResponseData;
  return redactedResponse;
};

export { redactText };
