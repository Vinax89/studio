import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-spending-habits.ts';
import '@/ai/flows/tax-estimation.ts';
import '@/ai/flows/analyze-receipt.ts';
import '@/ai/flows/suggest-debt-strategy.ts';
import '@/ai/flows/calculate-cashflow.ts';
