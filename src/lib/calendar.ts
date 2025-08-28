import { addDays, addMinutes, formatISO, isSameDay, parseISO } from "date-fns";
import type { Debt, Recurrence } from "./types";

export function monthMatrix(year: number, month: number, startOn: 0 | 1): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = (firstOfMonth.getDay() - startOn + 7) % 7;
  const startDate = addDays(firstOfMonth, -firstDay);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(startDate, i));
  return cells;
}

export function dateKey(date: Date): string {
  return formatISO(addMinutes(date, date.getTimezoneOffset()), {
    representation: "date",
  });
}

export function nextOccurrenceOnOrAfter(anchorISO: string, recurrence: Recurrence, onOrAfter: Date): Date | null {
  const anchor = parseISO(anchorISO);
  if (recurrence === "none") return isSameDay(anchor, onOrAfter) || anchor > onOrAfter ? anchor : null;
  const step = recurrence === "weekly" ? 7 : recurrence === "biweekly" ? 14 : 0;
  if (recurrence === "monthly") {
    let target = new Date(onOrAfter.getFullYear(), onOrAfter.getMonth(), anchor.getDate());
    if (target < onOrAfter && !isSameDay(target, onOrAfter)) {
      target = new Date(onOrAfter.getFullYear(), onOrAfter.getMonth() + 1, anchor.getDate());
    }
    if (target < anchor) {
      target.setFullYear(anchor.getFullYear());
      target.setMonth(anchor.getMonth());
      if (target < anchor) {
        target.setMonth(target.getMonth() + 1);
      }
    }
    return target;
  }
  const diffDays = Math.floor((onOrAfter.getTime() - anchor.getTime()) / 86400000);
  const k = diffDays <= 0 ? 0 : Math.ceil(diffDays / step);
  const candidate = addDays(anchor, k * step);
  return candidate < onOrAfter ? addDays(candidate, step) : candidate;
}

export function allOccurrencesInRange(debt: Debt, from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const maxIter = 400;
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate);
    if (d >= from && d <= to) out.push(d);
    return out;
  }
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from);
  let iter = 0;
  const stepDays = debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 0;

  while (cur && cur <= to && iter < maxIter) {
    out.push(new Date(cur));
    iter++;
    if (debt.recurrence === "monthly") {
      const nextDate = new Date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
      if (nextDate <= cur) {
        cur.setDate(cur.getDate() + 1);
        cur = new Date(cur.getFullYear(), cur.getMonth() + 1, debt.dueDate ? parseISO(debt.dueDate).getDate() : cur.getDate());
      } else {
        cur = nextDate;
      }
    } else {
      cur = addDays(cur, stepDays);
    }
  }
  return out;
}

export type Occurrence = { date: string; debt: Debt };

export function computeDebtOccurrences(debts: Debt[], from: Date, to: Date) {
  const occurrences: Occurrence[] = [];
  const grouped = new Map<string, Occurrence[]>();
  debts.forEach((d) => {
    const occ = allOccurrencesInRange(d, from, to);
    occ.forEach((dt) => {
      const oc = { date: dateKey(dt), debt: d };
      occurrences.push(oc);
      const arr = grouped.get(oc.date) ?? [];
      arr.push(oc);
      grouped.set(oc.date, arr);
    });
  });
  occurrences.sort((a, b) => a.date.localeCompare(b.date));
  return { occurrences, grouped } as const;
}

