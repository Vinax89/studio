import { useMemo } from "react";
import type { Debt } from "@/lib/types";
import { computeOccurrences, groupOccurrences, Occurrence } from "@/lib/debt-occurrences";

// Maximum number of occurrences to generate for a single debt
export const DEFAULT_MAX_OCCURRENCES = 400;

/**
 * React hook that computes and groups debt occurrences within a date range.
 *
 * @param debts - Debts to compute occurrences for.
 * @param from - Start of the date range (inclusive).
 * @param to - End of the date range (inclusive).
 * @param query - Search string used to filter grouped results.
 * @param maxOccurrences - Maximum occurrences to generate per debt.
 * @returns An object containing `occurrences` and `grouped` occurrences map.
 */
export function useDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  query: string,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES
) {
  const occurrences = useMemo<Occurrence[]>(
    () => computeOccurrences(debts, from, to, maxOccurrences),
    [debts, from, to, maxOccurrences]
  );
  const grouped = useMemo(
    () => groupOccurrences(occurrences, query),
    [occurrences, query]
  );
  return { occurrences, grouped } as const;
}

export type { Occurrence };
