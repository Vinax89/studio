import { useMemo } from "react";
import { CalendarDebt as Debt } from "@/lib/types";
import { computeOccurrences, groupOccurrences, Occurrence } from "@/lib/debt-occurrences";

export function useDebtOccurrences(debts: Debt[], from: Date, to: Date, query: string) {
  const occurrences = useMemo<Occurrence[]>(() => computeOccurrences(debts, from, to), [debts, from, to]);
  const grouped = useMemo(() => groupOccurrences(occurrences, query), [occurrences, query]);
  return { occurrences, grouped };
}

export type { Occurrence };
