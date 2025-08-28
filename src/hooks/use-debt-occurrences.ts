import { useMemo } from "react";
import type { Debt } from "@/lib/types";
import { computeOccurrences, groupOccurrences, Occurrence } from "@/lib/debt-occurrences";

// Maximum number of occurrences to generate for a single debt
export const DEFAULT_MAX_OCCURRENCES = 400;

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
  const grouped = useMemo(() => groupOccurrences(occurrences, query), [occurrences, query]);
  return { occurrences, grouped } as const;
}

export type { Occurrence };
