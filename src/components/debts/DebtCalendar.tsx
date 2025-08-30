"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Debt } from "@/lib/types";
import { useDebtOccurrences, DEFAULT_MAX_OCCURRENCES } from "@/hooks/use-debt-occurrences";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import DebtForm from "./DebtForm";
import DebtGrid from "./DebtGrid";
import { useDebts } from "@/lib/debts/use-debts";
import { formatCurrency } from "@/lib/currency";

interface DebtCalendarProps {
  onChange?: (debts: Debt[]) => void;
  startOn?: 0 | 1;
}

// ---------- Helpers ----------
const iso = (d: Date) => d.toISOString().slice(0, 10);
const parseISO = (s: string) => {
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
function monthMatrix(year: number, month: number, startOn: 0 | 1) {
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = (firstOfMonth.getDay() - startOn + 7) % 7;
  const startDate = addDays(firstOfMonth, -firstDay);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(startDate, i));
  return cells;
}

export default function DebtCalendar({ onChange, startOn = 0 }: DebtCalendarProps) {
  const { debts, addOrUpdateDebt, deleteDebt, markPaid, unmarkPaid } = useDebts();
  useEffect(() => { onChange?.(debts); }, [debts, onChange]);

    const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  const grid = useMemo(() => monthMatrix(cursor.getFullYear(), cursor.getMonth(), startOn), [cursor, startOn]);
  const gridFrom = grid[0];
  const gridTo = grid[grid.length - 1];

  const { occurrences, grouped } = useDebtOccurrences(
    debts,
    gridFrom,
    gridTo,
    query,
    DEFAULT_MAX_OCCURRENCES
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isCmd = navigator.platform.includes("Mac");
      if ((isCmd && e.metaKey && e.key.toLowerCase() === "k") || (!isCmd && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setSelectedDate(selectedDate ?? today);
        setActiveDebt(null);
        setShowForm(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedDate, today]);

  const monthTotals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let autopay = 0;
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">◀</Button>
          <div className="text-xl font-semibold select-none min-w-[10ch] text-center">{headerLabel}</div>
          <Button variant="outline" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">▶</Button>
          <Button variant="outline" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            aria-label="Search debts"
            placeholder="Search…"
            className="w-full sm:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={() => { setSelectedDate(today); setActiveDebt(null); setShowForm(true); }}>New</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Stat label="Month Total" value={formatCurrency(monthTotals.total, "USD")} />
        <Stat label="Scheduled (Autopay)" value={formatCurrency(monthTotals.autopay, "USD")} />
        <Stat label="Marked Paid" value={formatCurrency(monthTotals.paid, "USD")} />
      </div>

      <DebtGrid
        grid={grid}
        grouped={grouped}
        today={today}
        cursor={cursor}
        startOn={startOn}
        onSelectDate={(date) => { setSelectedDate(date); setActiveDebt(null); setShowForm(true); }}
        onSelectDebt={(date, debt) => { setSelectedDate(date); setActiveDebt(debt); setShowForm(true); }}
      />

      {showForm && (
        <DebtForm
          dateISO={selectedDate ? iso(selectedDate) : iso(today)}
          initial={activeDebt}
          onClose={() => setShowForm(false)}
          onDelete={activeDebt ? () => { deleteDebt(activeDebt.id); setShowForm(false); } : undefined}
          onSave={(values) => {
            const next: Debt = activeDebt ? { ...activeDebt, ...values } : { ...values, id: crypto.randomUUID() };
            addOrUpdateDebt(next);
            setShowForm(false);
          }}
          onMarkPaid={(dateISO) => activeDebt && markPaid(dateISO, activeDebt.id)}
          onUnmarkPaid={(dateISO) => activeDebt && unmarkPaid(dateISO, activeDebt.id)}
        />
      )}
    </div>
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
