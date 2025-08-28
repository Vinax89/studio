"use client";

import React, { useEffect, useState } from "react";
import type { Debt } from "@/lib/types";
import DebtForm from "./DebtForm";
import DebtGrid from "./DebtGrid";
import { useDebts } from "@/lib/debts/use-debts";

interface DebtCalendarProps {
  onChange?: (debts: Debt[]) => void;
  startOn?: 0 | 1;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

export default function DebtCalendar({ onChange, startOn = 0 }: DebtCalendarProps) {
  const { debts, addOrUpdateDebt, deleteDebt, markPaid, unmarkPaid } = useDebts();
  useEffect(() => { onChange?.(debts); }, [debts, onChange]);

  const today = new Date();
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

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

  return (
    <div className="w-full max-w-6xl mx-auto">
      <DebtGrid
        debts={debts}
        cursor={cursor}
        startOn={startOn}
        query={query}
        onQueryChange={setQuery}
        onCursorChange={setCursor}
        today={today}
        onSelectDate={(date) => { setSelectedDate(date); setActiveDebt(null); setShowForm(true); }}
        onSelectDebt={(date, debt) => { setSelectedDate(date); setActiveDebt(debt); setShowForm(true); }}
        onNewDebt={() => { setSelectedDate(today); setActiveDebt(null); setShowForm(true); }}
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

