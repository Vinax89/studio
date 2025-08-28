import React, { useEffect, useRef, useState } from "react";
import type { Debt, Recurrence } from "@/lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

interface FormProps {
  dateISO: string;
  initial: Debt | null;
  onClose: () => void;
  onSave: (values: Omit<Debt, "id" | "paidDates">) => void;
  onDelete?: () => void;
  onMarkPaid: (dateISO: string) => void;
  onUnmarkPaid: (dateISO: string) => void;
}

export default function DebtForm({ dateISO, initial, onClose, onSave, onDelete, onMarkPaid, onUnmarkPaid }: FormProps) {
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
      color: color || undefined,
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
              <SelectTrigger><SelectValue /></SelectTrigger>
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
