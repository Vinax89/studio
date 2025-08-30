import { ai } from '@/ai/genkit';
import type { ZodType } from 'zod';

interface PromptFlowConfig<I, O> {
  name: string;
  prompt: string;
  inputSchema: ZodType<I>;
  outputSchema: ZodType<O>;
}

/**
 * Helper to compose a prompt and flow.
 *
 * Given a base name, schemas, and prompt text, this defines the Genkit prompt and
 * wraps it in a flow that validates input and output. The resulting flow function
 * can be called directly with the input type to produce the output type.
 */
export function definePromptFlow<I, O>({
  name,
  prompt,
  inputSchema,
  outputSchema,
}: PromptFlowConfig<I, O>) {
  const promptDef = ai.definePrompt({
    name: `${name}Prompt`,
    input: { schema: inputSchema },
    output: { schema: outputSchema },
    prompt,
  });

  return ai.defineFlow(
    {
      name: `${name}Flow`,
      inputSchema,
      outputSchema,
    },
    async (input: I) => {
      const { output } = await promptDef(input);
      if (!output) {
        throw new Error(`No output returned from ${name}Prompt`);
      }
      return output;
    },
  );
}
