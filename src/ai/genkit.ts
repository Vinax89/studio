import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { redactMiddleware } from './redact';

const modelName = (process.env.GENKIT_MODEL || 'gemini-2.5-flash').replace(
  /^googleai\//,
  ''
);

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(modelName, { use: [redactMiddleware] }),
});
