import { useMemo } from "react";
import { Debt } from "@/lib/types";
import { computeDebtOccurrences, Occurrence } from "@/lib/calendar";

export const DEFAULT_MAX_OCCURRENCES = 400;

export function useDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  query: string,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES
) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  const { occurrences, grouped } = useMemo(
    () => computeDebtOccurrences(debts, new Date(fromTime), new Date(toTime), maxOccurrences),
    [debts, fromTime, toTime, maxOccurrences]
  );

  const filtered = useMemo(() => {
    if (!query) return grouped;
    const map = new Map<string, Occurrence[]>();
    grouped.forEach((arr, date) => {
      const filteredArr = arr.filter((oc) =>
        `${oc.debt.name} ${oc.debt.notes ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      if (filteredArr.length) map.set(date, filteredArr);
    });
    return map;
  }, [grouped, query]);

  return { occurrences, grouped: filtered } as const;
}
