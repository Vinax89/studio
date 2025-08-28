import { useMemo } from "react";
import { Recurrence, CalendarDebt as Debt } from "@/lib/types";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const parseISO = (s: string) => {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
const addDays = (d: Date, days: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function nextOccurrenceOnOrAfter(anchorISO: string, recurrence: Recurrence, onOrAfter: Date): Date | null {
  const anchor = parseISO(anchorISO);
  if (recurrence === "none") return isSameDay(anchor, onOrAfter) || anchor > onOrAfter ? anchor : null;
  const step = recurrence === "weekly" ? 7 : recurrence === "biweekly" ? 14 : 0;
  if (recurrence === "monthly") {
    const target = new Date(onOrAfter.getFullYear(), onOrAfter.getMonth(), anchor.getDate());
    if (target < onOrAfter) target.setMonth(target.getMonth() + 1);
    return target;
  }
  const diffDays = Math.floor((onOrAfter.getTime() - anchor.getTime()) / 86400000);
  const k = diffDays <= 0 ? 0 : Math.ceil(diffDays / step);
  const candidate = addDays(anchor, k * step);
  return candidate < onOrAfter ? addDays(candidate, step) : candidate;
}

function allOccurrencesInRange(debt: Debt, from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const maxIter = 400;
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate);
    if (d >= from && d <= to) out.push(d);
    return out;
  }
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from);
  let iter = 0;
  const stepDays =
    debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 30;
  while (cur && cur <= to && iter < maxIter) {
    out.push(new Date(cur));
    if (debt.recurrence === "monthly") {
      const nextMonth = new Date(
        cur.getFullYear(),
        cur.getMonth() + 1,
        cur.getDate()
      );
      cur = nextMonth;
    } else {
      cur = addDays(cur, stepDays);
    }
    iter++;
  }
  return out;
}

function computeDebtOccurrences(debts: Debt[], from: Date, to: Date) {
  const occurrences: Occurrence[] = [];
  const grouped = new Map<string, Occurrence[]>();
  debts.forEach((d) => {
    const occ = allOccurrencesInRange(d, from, to);
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
  query: string
) {
  const { occurrences, grouped } = useMemo(
    () => computeDebtOccurrences(debts, from, to),
    [debts, from, to]
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

