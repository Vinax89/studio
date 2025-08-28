// This file uses server-side code.
'use server';

/**
 * @fileOverview Simple cost of living calculator based on state cost index and household size.
 *
 * - calculateCostOfLiving - Compute estimated monthly and annual expenses.
 * - CostOfLivingInput - The input type for calculateCostOfLiving.
 * - CostOfLivingOutput - The return type providing category breakdowns.
 */

import { getCostOfLivingIndex } from '@/data/costOfLiving';

export interface CostOfLivingInput {
  /** Two-letter state code (e.g., 'CA'). */
  location: string;
  /** Number of people in the household. */
  householdSize: number;
}

export interface ExpenseBreakdown {
  monthly: number;
  annual: number;
}

export interface CostOfLivingOutput {
  housing: ExpenseBreakdown;
  food: ExpenseBreakdown;
  transportation: ExpenseBreakdown;
  other: ExpenseBreakdown;
  total: ExpenseBreakdown;
}

const BASE_COSTS = {
  housing: 1000,
  food: 400,
  transportation: 300,
  other: 500,
};

export async function calculateCostOfLiving({ location, householdSize }: CostOfLivingInput): Promise<CostOfLivingOutput> {
  const index = getCostOfLivingIndex(location);
  const multiplier = (index / 100) * householdSize;

  const housingMonthly = BASE_COSTS.housing * multiplier;
  const foodMonthly = BASE_COSTS.food * multiplier;
  const transportationMonthly = BASE_COSTS.transportation * multiplier;
  const otherMonthly = BASE_COSTS.other * multiplier;

  const totalMonthly = housingMonthly + foodMonthly + transportationMonthly + otherMonthly;

  const toBreakdown = (monthly: number): ExpenseBreakdown => ({ monthly, annual: monthly * 12 });

  return {
    housing: toBreakdown(housingMonthly),
    food: toBreakdown(foodMonthly),
    transportation: toBreakdown(transportationMonthly),
    other: toBreakdown(otherMonthly),
    total: toBreakdown(totalMonthly),
  };
}
