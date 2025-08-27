import { CalendarDebt as Debt, Recurrence } from "@/lib/types";

export interface Occurrence {
  date: string;
  debt: Debt;
}

const occurrenceCache = new Map<string, Date[]>();

const iso = (d: Date) => d.toISOString().slice(0, 10);
const parseISO = (s: string) => {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

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

export function allOccurrencesInRange(debt: Debt, from: Date, to: Date): Date[] {
  const key = `${debt.id}|${debt.dueDate}|${debt.recurrence}|${from.toISOString()}|${to.toISOString()}`;
  const cached = occurrenceCache.get(key);
  if (cached) return cached.map((d) => new Date(d));
  const out: Date[] = [];
  const maxIter = 400;
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate);
    if (d >= from && d <= to) out.push(d);
    occurrenceCache.set(key, out);
    return out.map((d) => new Date(d));
  }
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from);
  let iter = 0;
  const stepDays = debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 30;
  while (cur && cur <= to && iter < maxIter) {
    out.push(new Date(cur));
    if (debt.recurrence === "monthly") {
      const nextMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, cur.getDate());
      cur = nextMonth;
    } else {
      cur = addDays(cur, stepDays);
    }
    iter++;
  }
  occurrenceCache.set(key, out);
  return out.map((d) => new Date(d));
}

export function computeOccurrences(debts: Debt[], from: Date, to: Date): Occurrence[] {
  const results: Occurrence[] = [];
  debts.forEach((d) => {
    allOccurrencesInRange(d, from, to).forEach((dt) => results.push({ date: iso(dt), debt: d }));
  });
  return results.sort((a, b) => a.date.localeCompare(b.date));
}

const groupCache = new Map<string, Map<string, Occurrence[]>>();

export function groupOccurrences(occurrences: Occurrence[], query: string): Map<string, Occurrence[]> {
  const key = JSON.stringify({ items: occurrences.map((o) => o.debt.id + o.date).join(","), query });
  const cached = groupCache.get(key);
  if (cached) return cached;
  const map = new Map<string, Occurrence[]>();
  for (const oc of occurrences) {
    if (query && !(`${oc.debt.name} ${oc.debt.notes ?? ""}`.toLowerCase().includes(query.toLowerCase()))) continue;
    const arr = map.get(oc.date) ?? [];
    arr.push(oc);
    map.set(oc.date, arr);
  }
  groupCache.set(key, map);
  return map;
}
