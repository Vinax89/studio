import { useMemo } from "react";
import { Recurrence, Debt } from "@/lib/types";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  differenceInMonths,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns";

// Maximum number of occurrences to generate for a single debt
export const DEFAULT_MAX_OCCURRENCES = 400;

const iso = (d: Date) => d.toISOString().slice(0, 10);

function nextOccurrenceOnOrAfter(
  anchorISO: string,
  recurrence: Recurrence,
  onOrAfter: Date,
): Date | null {
  const anchor = parseISO(anchorISO);
  if (recurrence === "none")
    return isSameDay(anchor, onOrAfter) || isAfter(anchor, onOrAfter)
      ? anchor
      : null;
  if (recurrence === "monthly") {
    if (isBefore(onOrAfter, anchor)) return anchor;
    const monthsDiff = differenceInMonths(onOrAfter, anchor);
    let candidate = addMonths(anchor, monthsDiff);
    if (isBefore(candidate, onOrAfter)) {
      candidate = addMonths(candidate, 1);
    }
    return candidate;
  }
  const step = recurrence === "weekly" ? 7 : 14;
  const diffDays = differenceInCalendarDays(onOrAfter, anchor);
  const k = diffDays <= 0 ? 0 : Math.ceil(diffDays / step);
  const candidate = addDays(anchor, k * step);
  return isBefore(candidate, onOrAfter) ? addDays(candidate, step) : candidate;
}

function allOccurrencesInRange(
  debt: Debt,
  from: Date,
  to: Date,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES,
): Date[] {
  const out: Date[] = [];
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate);
    if (!isBefore(d, from) && !isAfter(d, to)) out.push(d);
    return out;
  }
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from);
  let iter = 0;
  const stepDays =
    debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 0;

  while (cur && !isAfter(cur, to) && iter < maxOccurrences) {
    out.push(cur);
    iter++;
    cur =
      debt.recurrence === "monthly"
        ? addMonths(cur, 1)
        : addDays(cur, stepDays);
  }
  if (cur && !isAfter(cur, to)) {
    console.warn(
      `Debt occurrences truncated at ${maxOccurrences} iterations for debt ${debt.name}`,
    );
  }
  return out;
}

function computeDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES,
) {
  const occurrences: Occurrence[] = [];
  const grouped = new Map<string, Occurrence[]>();
  debts.forEach((d) => {
    const occ = allOccurrencesInRange(d, from, to, maxOccurrences);
    occ.forEach((dt) => {
      const oc = { date: iso(dt), debt: d };
      occurrences.push(oc);
      const arr = grouped.get(oc.date) ?? [];
      arr.push(oc);
      grouped.set(oc.date, arr);
    });
  });
  occurrences.sort((a, b) => a.date.localeCompare(b.date));
  return { occurrences, grouped } as const;
}

export type Occurrence = { date: string; debt: Debt };

export function useDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  query: string,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES,
) {
  const fromTime = from.getTime();
  const toTime = to.getTime();
  const { occurrences, grouped } = useMemo(
    () =>
      computeDebtOccurrences(
        debts,
        new Date(fromTime),
        new Date(toTime),
        maxOccurrences,
      ),
    [debts, fromTime, toTime, maxOccurrences],
  );

  const filtered = useMemo(() => {
    if (!query) return grouped;
    const map = new Map<string, Occurrence[]>();
    grouped.forEach((arr, date) => {
      const filteredArr = arr.filter((oc) =>
        `${oc.debt.name} ${oc.debt.notes ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      );
      if (filteredArr.length) map.set(date, filteredArr);
    });
    return map;
  }, [grouped, query]);

  return { occurrences, grouped: filtered } as const;
}
