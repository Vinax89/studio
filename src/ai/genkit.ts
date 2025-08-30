import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {redactionMiddleware} from './redaction';

const model = process.env.GENKIT_MODEL || 'googleai/gemini-2.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model,
  use: [redactionMiddleware],
} as any);
