import React from "react";
import type { Debt } from "@/lib/types";
import { formatCurrency } from "@/lib/currency";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const iso = (d: Date) => d.toISOString().slice(0, 10);
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

interface Occurrence { debt: Debt; date: string }

interface DebtGridProps {
  grid: Date[];
  grouped: Map<string, Occurrence[]>;
  today: Date;
  cursor: Date;
  startOn: 0 | 1;
  onSelectDate: (date: Date) => void;
  onSelectDebt: (date: Date, debt: Debt) => void;
}

export default function DebtGrid({ grid, grouped, today, cursor, startOn, onSelectDate, onSelectDebt }: DebtGridProps) {
  return (
    <>
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
              className={
                "relative min-h-[110px] rounded-lg p-2 bg-background border cursor-pointer " +
                (inMonth ? "border-border " : "border-transparent opacity-50 ") +
                (isToday ? " ring-2 ring-primary " : "")
              }
              role="gridcell"
              aria-label={`${date.toDateString()} — ${formatCurrency(sumForDay, "USD")}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-chip]") || (e.target as HTMLElement).closest("[data-menu]") ) return;
                onSelectDate(date);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground select-none">{date.getDate()}</div>
                {sumForDay > 0 && (
                  <div className={`text-xs px-2 py-0.5 rounded-full ${isPast && sumForDay > 0 ? "bg-destructive/10 text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>
                    {formatCurrency(sumForDay, "USD")}
                  </div>
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
                      title={`${debt.name} — ${formatCurrency(debt.minimumPayment, "USD")}${debt.notes ? "\n" + debt.notes : ""}`}
                      onClick={() => onSelectDebt(date, debt)}
                    >
                      <span className={`truncate ${paid ? "line-through" : ""}`}>{debt.name}</span>
                      <span className={`ml-auto tabular-nums ${paid ? "line-through" : "font-semibold"}`}>{formatCurrency(debt.minimumPayment, "USD")}</span>
                      {debt.autopay && <span className="text-[10px] px-1 py-0.5 rounded bg-black/10">AUTO</span>}
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
