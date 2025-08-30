// This file uses server-side code.
'use server';

/**
 * @fileOverview Analyzes a receipt image and extracts transaction details.
 *
 * - analyzeReceipt - A function that analyzes a receipt image.
 * - AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * - AnalyzeReceiptOutput - The return type for the analyzeReceipt function.
 */

import {DATA_URI_REGEX} from '@/lib/data-uri';
import {definePromptFlow} from './utils';
import {z} from 'genkit';

export const AnalyzeReceiptInputSchema = z.object({
  receiptImage: z
    .string()
    .regex(DATA_URI_REGEX)
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

export const analyzeReceipt = definePromptFlow<
  AnalyzeReceiptInput,
  AnalyzeReceiptOutput
>({
  name: 'analyzeReceipt',
  inputSchema: AnalyzeReceiptInputSchema,
  outputSchema: AnalyzeReceiptOutputSchema,
  prompt: `You are an expert receipt scanner. Analyze the provided receipt image and extract the vendor name (for the description), the total amount, and suggest a relevant category for a nursing professional (e.g., Food, Uniforms, Supplies, Transport, Certifications, Other). The transaction type is always 'Expense'.

Receipt Image: {{media url=receiptImage}}`,
});
