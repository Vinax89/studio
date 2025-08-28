"use client";

import React, { useMemo } from "react";
import type { Debt } from "@/lib/types";
import { useDebtOccurrences, DEFAULT_MAX_OCCURRENCES } from "@/hooks/use-debt-occurrences";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface DebtGridProps {
  debts: Debt[];
  cursor: Date;
  startOn: 0 | 1;
  query: string;
  onQueryChange: (v: string) => void;
  onCursorChange: (d: Date) => void;
  today: Date;
  onSelectDate: (d: Date) => void;
  onSelectDebt: (d: Date, debt: Debt) => void;
  onNewDebt: () => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const parseISO = (s: string) => { const [y, m, dd] = s.split("-").map(Number); return new Date(y, m - 1, dd); };
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

function monthMatrix(year: number, month: number, startOn: 0 | 1) {
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = (firstOfMonth.getDay() - startOn + 7) % 7;
  const startDate = addDays(firstOfMonth, -firstDay);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(startDate, i));
  return cells;
}

export default function DebtGrid({ debts, cursor, startOn, query, onQueryChange, onCursorChange, today, onSelectDate, onSelectDebt, onNewDebt }: DebtGridProps) {
  const grid = useMemo(() => monthMatrix(cursor.getFullYear(), cursor.getMonth(), startOn), [cursor, startOn]);
  const gridFrom = grid[0];
  const gridTo = grid[grid.length - 1];

  const { occurrences, grouped } = useDebtOccurrences(debts, gridFrom, gridTo, query, DEFAULT_MAX_OCCURRENCES);

  const monthTotals = useMemo(() => {
    let total = 0; let paid = 0; let autopay = 0;
    for (const oc of occurrences) {
      const dt = parseISO(oc.date);
      if (dt.getMonth() !== cursor.getMonth()) continue;
      total += oc.debt.minimumPayment;
      if (oc.debt.autopay) autopay += oc.debt.minimumPayment;
      if (oc.debt.paidDates?.includes(oc.date)) paid += oc.debt.minimumPayment;
    }
    return { total, paid, autopay };
  }, [occurrences, cursor]);

  const headerLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">◀</Button>
          <div className="text-xl font-semibold select-none min-w-[10ch] text-center">{headerLabel}</div>
          <Button variant="outline" onClick={() => onCursorChange(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">▶</Button>
          <Button variant="outline" onClick={() => onCursorChange(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input aria-label="Search debts" placeholder="Search…" className="w-full sm:w-64" value={query} onChange={(e) => onQueryChange(e.target.value)} />
          <Button onClick={onNewDebt}>New</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Stat label="Month Total" value={currency(monthTotals.total)} />
        <Stat label="Scheduled (Autopay)" value={currency(monthTotals.autopay)} />
        <Stat label="Marked Paid" value={currency(monthTotals.paid)} />
      </div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="py-2 select-none">{WEEKDAYS[(i + startOn) % 7]}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 rounded-lg bg-muted/50 p-1">
        {grid.map((date, idx) => {
          const inMonth = date.getMonth() === cursor.getMonth();
          const dateISO = iso(date);
          const dayEvents = grouped.get(dateISO) ?? [];
          const isToday = isSameDay(date, today);
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const sumForDay = dayEvents.reduce((s, e) => s + e.debt.minimumPayment, 0);

          return (
            <div
              key={idx}
              className={"relative min-h-[110px] rounded-lg p-2 bg-background border cursor-pointer " + (inMonth ? "border-border " : "border-transparent opacity-50 ") + (isToday ? " ring-2 ring-primary " : "")}
              role="gridcell"
              aria-label={`${date.toDateString()} — ${currency(sumForDay)} due`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-chip]") || (e.target as HTMLElement).closest("[data-menu]")) return;
                onSelectDate(date);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground select-none">{date.getDate()}</div>
                {sumForDay > 0 && (
                  <div className={"text-xs px-2 py-0.5 rounded-full " + (isPast && sumForDay > 0 ? "bg-destructive/10 text-destructive-foreground" : "bg-muted text-muted-foreground")}>{currency(sumForDay)}</div>
                )}
              </div>

              <div className="mt-2 flex flex-col gap-1">
                {dayEvents.map(({ debt }) => {
                  const paid = debt.paidDates?.includes(dateISO);
                  const chipStyle: React.CSSProperties = {
                    backgroundColor: debt.color ?? (paid ? "#d1fae5" : "#e5e7eb"),
                  };
                  return (
                    <div
                      key={debt.id + dateISO}
                      data-chip
                      className="group flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer hover:opacity-90"
                      style={chipStyle}
                      title={`${debt.name} — ${currency(debt.minimumPayment)}${debt.notes ? "\n" + debt.notes : ""}`}
                      onClick={() => onSelectDebt(date, debt)}
                    >
                      <div className="flex-1 truncate">{debt.name}</div>
                      {paid && <span className="text-green-700">✔</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card text-card-foreground border p-4 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

