import { useMemo } from "react";
import type { Debt } from "@/lib/types";
import { computeDebtOccurrences, Occurrence } from "@/lib/calendar";

// Maximum number of occurrences to generate for a single debt
export const DEFAULT_MAX_OCCURRENCES = 400;

/**
 * React hook that expands debts into dated occurrences and groups them by day.
 *
 * The grouped map is filtered by `query`, which matches against a debt's name
 * and optional notes. The returned `occurrences` list is unaffected by this
 * filtering.
 *
 * @param debts - Debts to compute occurrences for.
 * @param from - Start of the date range (inclusive).
 * @param to - End of the date range (inclusive).
 * @param query - Search string used to filter the grouped map by debt info.
 * @param maxOccurrences - Maximum occurrences to generate per debt.
 * @returns An object containing the flat `occurrences` list and a `grouped`
 * map keyed by ISO date string after filtering.
 */
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
    () =>
      computeDebtOccurrences(
        debts,
        new Date(fromTime),
        new Date(toTime),
        maxOccurrences
      ),
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
