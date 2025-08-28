// This file uses server-side code.
'use server';

/**
 * @fileOverview Analyzes a receipt image and extracts transaction details.
 *
 * - analyzeReceipt - A function that analyzes a receipt image.
 * - AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * - AnalyzeReceiptOutput - The return type for the analyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DATA_URI_REGEX = /^data:[\w.+-]+\/[\w.+-]+;base64,[A-Za-z0-9+/=]+$/;
const MAX_DATA_URI_SIZE = 5 * 1024 * 1024; // 5MB

const AnalyzeReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .regex(DATA_URI_REGEX, {
      message:
        "Invalid data URI format. Expected 'data:<mimetype>;base64,<encoded_data>'.",
    })
    .refine(
      value => {
        const base64 = value.split(',')[1];
        if (!base64) return false;
        return Buffer.from(base64, 'base64').length <= MAX_DATA_URI_SIZE;
      },
      {
        message: `Encoded data must be <= ${MAX_DATA_URI_SIZE} bytes`,
      }
    )
    .describe(
      "An image of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeReceiptInput = z.infer<typeof AnalyzeReceiptInputSchema>;

const AnalyzeReceiptOutputSchema = z.object({
    description: z.string().describe("The name of the vendor or a brief description of the transaction."),
    amount: z.number().describe("The total amount of the transaction."),
    category: z.string().describe("A suggested category for the transaction (e.g., Food, Transport, Supplies)."),
});
export type AnalyzeReceiptOutput = z.infer<typeof AnalyzeReceiptOutputSchema>;

export async function analyzeReceipt(input: AnalyzeReceiptInput): Promise<AnalyzeReceiptOutput> {
  return analyzeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReceiptPrompt',
  input: {schema: AnalyzeReceiptInputSchema},
  output: {schema: AnalyzeReceiptOutputSchema},
  prompt: `You are an expert receipt scanner. Analyze the provided receipt image and extract the vendor name (for the description), the total amount, and suggest a relevant category for a nursing professional (e.g., Food, Uniforms, Supplies, Transport, Certifications, Other). The transaction type is always 'Expense'.

Receipt Image: {{media url=receiptImage}}`,
});

const analyzeReceiptFlow = ai.defineFlow(
  {
    name: 'analyzeReceiptFlow',
    inputSchema: AnalyzeReceiptInputSchema,
    outputSchema: AnalyzeReceiptOutputSchema,
  },
  async input => {
    const parsed = AnalyzeReceiptInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map(i => i.message).join(', '));
    }
    const {output} = await prompt(parsed.data);
    if (!output) {
      throw new Error('No output returned from analyzeReceiptPrompt');
    }
    return output;
  }
);
