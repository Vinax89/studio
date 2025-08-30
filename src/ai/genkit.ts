import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { redactMiddleware } from './redact';

const modelName = process.env.GENKIT_MODEL || 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(modelName, { use: [redactMiddleware] }),
});
