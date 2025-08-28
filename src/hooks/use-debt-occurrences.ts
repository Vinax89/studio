
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

// Hard cap to avoid infinite loops if data is malformed.
export const DEFAULT_MAX_OCCURRENCES = 400;

const iso = (d: Date) => d.toISOString().slice(0, 10);

function nextOccurrenceOnOrAfter(
  anchorISO: string,
  recurrence: Recurrence,
  onOrAfter: Date
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

// Dynamically compute a reasonable maximum number of iterations for the
// recurrence based on the date span requested. This prevents runaway loops
// while still allowing longer ranges to be fully evaluated.
function dynamicMaxOccurrences(
  recurrence: Recurrence,
  from: Date,
  to: Date
): number {
  if (recurrence === "none") return 1;
  if (recurrence === "monthly") {
    return Math.min(differenceInMonths(to, from) + 2, DEFAULT_MAX_OCCURRENCES);
  }
  const step = recurrence === "weekly" ? 7 : 14;
  const span = differenceInCalendarDays(to, from);
  return Math.min(Math.ceil(span / step) + 2, DEFAULT_MAX_OCCURRENCES);
}

// Yield occurrences lazily instead of constructing a full array.
function* allOccurrencesInRange(
  debt: Debt,
  from: Date,
  to: Date,
  maxOccurrences?: number
): Generator<Date> {
  const limit =
    maxOccurrences ?? dynamicMaxOccurrences(debt.recurrence, from, to);
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate);
    if (!isBefore(d, from) && !isAfter(d, to)) yield d;
    return;
  }
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from);
  let iter = 0;
  const stepDays =
    debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 0;

  while (cur && !isAfter(cur, to) && iter < limit) {
    yield cur;
    iter++;
    cur =
      debt.recurrence === "monthly"
        ? addMonths(cur, 1)
        : addDays(cur, stepDays);
  }
  if (cur && !isAfter(cur, to)) {
    console.warn(
      `Debt occurrences truncated at ${limit} iterations for debt ${debt.name}`
    );
  }
}

// Cache occurrences per debt and range so subsequent renders do not recompute
// the same values. Cache key is based on debt id and the requested range.
const occurrenceCache = new Map<string, Map<string, Date[]>>();

function rangeKey(from: Date, to: Date, max?: number) {
  return `${iso(from)}|${iso(to)}|${max ?? "auto"}`;
}

function cachedOccurrences(
  debt: Debt,
  from: Date,
  to: Date,
  maxOccurrences?: number
): Date[] {
  const key = rangeKey(from, to, maxOccurrences);
  let debtMap = occurrenceCache.get(debt.id);
  if (!debtMap) {
    debtMap = new Map();
    occurrenceCache.set(debt.id, debtMap);
  }
  const cached = debtMap.get(key);
  if (cached) return cached;
  const arr = Array.from(allOccurrencesInRange(debt, from, to, maxOccurrences));
  debtMap.set(key, arr);
  return arr;
}

function computeDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  maxOccurrences?: number
) {
  const occurrences: Occurrence[] = [];
  const grouped = new Map<string, Occurrence[]>();
  debts.forEach((d) => {
    const occ = cachedOccurrences(d, from, to, maxOccurrences);
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
  maxOccurrences?: number
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
