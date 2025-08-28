
import { useMemo } from "react";
import { Debt } from "@/lib/types";
import { computeDebtOccurrences, Occurrence } from "@/lib/calendar";

export function useDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  query: string
) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  const { occurrences, grouped } = useMemo(
    () =>
      computeDebtOccurrences(debts, new Date(fromTime), new Date(toTime)),
    [debts, fromTime, toTime]
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
