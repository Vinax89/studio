import {genkit} from 'genkit';
import {openAI} from '@genkit-ai/openai';

const model = process.env.GENKIT_MODEL || 'openai/gpt-4o-mini';

export const ai = genkit({
  plugins: [openAI()],
  model,
});
