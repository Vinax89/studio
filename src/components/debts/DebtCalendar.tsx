
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Recurrence, Debt } from "@/lib/types"; // Use the unified Debt type
import { useDebtOccurrences } from "@/hooks/use-debt-occurrences";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

interface DebtCalendarProps {
  storageKey?: string; 
  initialDebts?: Debt[]; 
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
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

function monthMatrix(year: number, month: number, startOn: 0 | 1) {
  const firstOfMonth = new Date(year, month, 1);
  const firstDay = (firstOfMonth.getDay() - startOn + 7) % 7; 
  const startDate = addDays(firstOfMonth, -firstDay);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(startDate, i));
  return cells;
}


function useLocalStorage(key: string | undefined, value: Debt[] | undefined) {
  useEffect(() => {
    if (typeof window === 'undefined' || !key || value === undefined) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
}

function useLocalStorageSeed(key?: string, seed?: Debt[]) {
  const [state, setState] = useState<Debt[]>(() => {
    if (typeof window === 'undefined') return seed ?? [];
    if (!key) return seed ?? [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return seed ?? [];
  });
  return [state, setState] as const;
}

// ---------- Component ----------
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DebtCalendar({ storageKey = "debt.calendar", initialDebts = [], onChange, startOn = 0 }: DebtCalendarProps) {
  const [debts, setDebts] = useLocalStorageSeed(storageKey, initialDebts);
  useLocalStorage(storageKey, debts);
  useEffect(() => { onChange?.(debts); }, [debts, onChange]);

  const today = new Date();
  const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");

  const grid = useMemo(() => monthMatrix(cursor.getFullYear(), cursor.getMonth(), startOn), [cursor, startOn]);

  const gridFrom = grid[0];
  const gridTo = grid[grid.length - 1];

  const { occurrences, grouped } = useDebtOccurrences(debts, gridFrom, gridTo, query);

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

  function addOrUpdateDebt(next: Debt) {
    setDebts((prev) => {
      const idx = prev.findIndex((d) => d.id === next.id);
      const updated = idx >= 0 ? [...prev.slice(0, idx), next, ...prev.slice(idx + 1)] : [...prev, next];
      return updated;
    });
  }
  function deleteDebt(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }
  function markPaid(dateISO: string, id: string) {
    setDebts((prev) => prev.map((d) => d.id !== id ? d : { ...d, paidDates: Array.from(new Set([...(d.paidDates ?? []), dateISO])) }));
  }
  function unmarkPaid(dateISO: string, id: string) {
    setDebts((prev) => prev.map((d) => d.id !== id ? d : { ...d, paidDates: (d.paidDates ?? []).filter((x) => x !== dateISO) }));
  }

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
              className={
                "relative min-h-[110px] rounded-lg p-2 bg-background border cursor-pointer " +
                (inMonth ? "border-border " : "border-transparent opacity-50 ") +
                (isToday ? " ring-2 ring-primary " : "")
              }
              role="gridcell"
              aria-label={`${date.toDateString()} — ${currency(sumForDay)} due`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-chip]") || (e.target as HTMLElement).closest("[data-menu]") ) return;
                setSelectedDate(date);
                setActiveDebt(null);
                setShowForm(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-muted-foreground select-none">{date.getDate()}</div>
                {sumForDay > 0 && (
                  <div className={"text-xs px-2 py-0.5 rounded-full " + (isPast && sumForDay > 0 ? "bg-destructive/10 text-destructive-foreground" : "bg-muted text-muted-foreground")}>
                    {currency(sumForDay)}
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
                      title={`${debt.name} — ${currency(debt.minimumPayment)}${debt.notes ? "\n" + debt.notes : ""}`}
                      onClick={() => { setSelectedDate(date); setActiveDebt(debt); setShowForm(true); }}
                    >
                      <span className={"truncate " + (paid ? "line-through" : "")}>{debt.name}</span>
                      <span className={"ml-auto tabular-nums " + (paid ? "line-through" : "font-semibold")}>{currency(debt.minimumPayment)}</span>
                      {debt.autopay && <span className="text-[10px] px-1 py-0.5 rounded bg-black/10">AUTO</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

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

interface FormProps {
  dateISO: string;
  initial: Debt | null;
  onClose: () => void;
  onSave: (values: Omit<Debt, "id" | "paidDates">) => void;
  onDelete?: () => void;
  onMarkPaid: (dateISO: string) => void;
  onUnmarkPaid: (dateISO: string) => void;
}

function DebtForm({ dateISO, initial, onClose, onSave, onDelete, onMarkPaid, onUnmarkPaid }: FormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [initialAmount, setInitialAmount] = useState<string>(initial ? String(initial.initialAmount) : "");
  const [currentAmount, setCurrentAmount] = useState<string>(initial ? String(initial.currentAmount) : "");
  const [interestRate, setInterestRate] = useState<string>(initial ? String(initial.interestRate) : "");
  const [minimumPayment, setMinimumPayment] = useState<string>(initial ? String(initial.minimumPayment) : "");
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate ?? dateISO);
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? "none");
  const [autopay, setAutopay] = useState<boolean>(initial?.autopay ?? false);
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [color, setColor] = useState<string>(initial?.color ?? "#e5e7eb");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);

  useEffect(() => { ref.current?.focus(); }, []);

  const paidToday = initial?.paidDates?.includes(dateISO) ?? false;

  function handleSave() {
    const initAmt = Number.parseFloat(initialAmount);
    const currAmt = Number.parseFloat(currentAmount);
    const intRate = Number.parseFloat(interestRate);
    const minPay = Number.parseFloat(minimumPayment);

    if (!name.trim() || [initAmt, currAmt, intRate, minPay].some(isNaN) || minPay <= 0) {
      // Add more specific validation feedback if needed
      return;
    }
    
    const payload: Omit<Debt, "id" | "paidDates"> = { 
        name: name.trim(), 
        initialAmount: initAmt,
        currentAmount: currAmt,
        interestRate: intRate,
        minimumPayment: minPay,
        dueDate, 
        recurrence, 
        autopay, 
        notes: notes.trim() || undefined, 
        color: color || undefined 
    };
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div ref={ref} tabIndex={-1} className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl outline-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{initial ? "Edit" : "Add"} Debt</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">✕</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormLabel label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., X1 Card" /></FormLabel>
          <FormLabel label="Interest Rate (%)"><Input value={interestRate} onChange={(e) => setInterestRate(e.target.value)} type="number" placeholder="5.5" /></FormLabel>
          <FormLabel label="Initial Amount ($)"><Input value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} type="number" placeholder="5000" /></FormLabel>
          <FormLabel label="Current Amount ($)"><Input value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} type="number" placeholder="3250" /></FormLabel>
          <FormLabel label="Minimum Payment ($)"><Input value={minimumPayment} onChange={(e) => setMinimumPayment(e.target.value)} type="number" placeholder="150" /></FormLabel>
          <FormLabel label="Anchor Due Date"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></FormLabel>
          <FormLabel label="Recurrence">
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as Recurrence)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly (same day)</SelectItem>
              </SelectContent>
            </Select>
          </FormLabel>
          <FormLabel label="Chip Color (optional)"><Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 p-1" /></FormLabel>
          <FormLabel label="Autopay" full><Toggle checked={autopay} onChange={setAutopay} /></FormLabel>
          <FormLabel label="Notes" full>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" placeholder="Internal notes…" />
          </FormLabel>
        </div>

        {initial && (
          <div className="mt-4 p-3 rounded-xl bg-muted/80 border flex items-center gap-2">
            <span className="text-sm font-medium">Status for <strong>{dateISO}</strong>:</span>
            {!paidToday ? (
              <Button size="sm" onClick={() => onMarkPaid(dateISO)}>Mark Paid</Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onUnmarkPaid(dateISO)}>Undo Paid</Button>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Tip: Press <kbd className="kbd">Ctrl/Cmd+K</kbd> to quick‑add</div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>Delete</Button>
            )}
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormLabel({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={(full ? "sm:col-span-2 " : "") + "flex flex-col gap-1.5"}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={"w-12 h-7 rounded-full border transition relative " + (checked ? "bg-primary border-primary" : "bg-muted border-border")}
    >
      <span className={"absolute top-0.5 transition-transform duration-200 ease-in-out " + (checked ? "translate-x-5" : "translate-x-0.5")}
        style={{ width: 24, height: 24 }}>
        <span className="block w-6 h-6 rounded-full bg-background shadow" />
      </span>
    </button>
  );
}
