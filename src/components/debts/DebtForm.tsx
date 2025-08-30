import React, { useEffect, useRef } from "react";
import type { Debt } from "@/lib/types";
import { useDebtForm, DebtFormValues } from "@/hooks/use-debt-form";
import { Controller } from "react-hook-form";
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
  const { control, register, handleSubmit, formState: { errors } } = useDebtForm(initial, dateISO);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);

  useEffect(() => { ref.current?.focus(); }, []);

  const paidToday = initial?.paidDates?.includes(dateISO) ?? false;

  const handleSave = handleSubmit((values: DebtFormValues) => {
    const payload: Omit<Debt, "id" | "paidDates"> = { ...values };
    if (payload.notes) payload.notes = payload.notes.trim();
    else delete (payload as any).notes;
    if (payload.color === "" || payload.color === undefined) {
      delete (payload as any).color;
    }
    onSave(payload);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div ref={ref} tabIndex={-1} className="w-full max-w-lg rounded-2xl bg-background p-6 shadow-2xl outline-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{initial ? "Edit" : "Add"} Debt</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">✕</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormLabel label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="e.g., X1 Card" />
          </FormLabel>
          <FormLabel label="Interest Rate (%)" error={errors.interestRate?.message}>
            <Input type="number" {...register("interestRate", { valueAsNumber: true })} placeholder="5.5" />
          </FormLabel>
          <FormLabel label="Initial Amount ($)" error={errors.initialAmount?.message}>
            <Input type="number" {...register("initialAmount", { valueAsNumber: true })} placeholder="5000" />
          </FormLabel>
          <FormLabel label="Current Amount ($)" error={errors.currentAmount?.message}>
            <Input type="number" {...register("currentAmount", { valueAsNumber: true })} placeholder="3250" />
          </FormLabel>
          <FormLabel label="Minimum Payment ($)" error={errors.minimumPayment?.message}>
            <Input type="number" {...register("minimumPayment", { valueAsNumber: true })} placeholder="150" />
          </FormLabel>
          <FormLabel label="Anchor Due Date" error={errors.dueDate?.message}>
            <Input type="date" {...register("dueDate")} />
          </FormLabel>
          <FormLabel label="Recurrence" error={errors.recurrence?.message}>
            <Controller
              control={control}
              name="recurrence"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly (same day)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormLabel>
          <FormLabel label="Chip Color (optional)" error={errors.color?.message}>
            <Input type="color" className="h-10 p-1" {...register("color")} />
          </FormLabel>
          <FormLabel label="Autopay" full>
            <Controller
              control={control}
              name="autopay"
              render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
            />
          </FormLabel>
          <FormLabel label="Notes" full error={errors.notes?.message}>
            <Textarea {...register("notes")} className="min-h-[80px]" placeholder="Internal notes…" />
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

function FormLabel({ label, children, full, error }: { label: string; children: React.ReactNode; full?: boolean; error?: string }) {
  return (
    <div className={(full ? "sm:col-span-2 " : "") + "flex flex-col gap-1.5"}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
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
