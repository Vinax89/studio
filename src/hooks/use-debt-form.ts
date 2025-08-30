import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DebtFormSchema, DebtFormValues } from "@/lib/debt-schema";
import type { Debt } from "@/lib/types";

export function useDebtForm(initial: Debt | null, dateISO: string) {
  return useForm<DebtFormValues>({
    resolver: zodResolver(DebtFormSchema),
    defaultValues: {
      name: initial?.name ?? "",
      initialAmount: initial?.initialAmount,
      currentAmount: initial?.currentAmount,
      interestRate: initial?.interestRate,
      minimumPayment: initial?.minimumPayment,
      dueDate: initial?.dueDate ?? dateISO,
      recurrence: initial?.recurrence ?? "none",
      autopay: initial?.autopay ?? false,
      notes: initial?.notes ?? "",
      color: initial?.color ?? "#e5e7eb",
    },
  });
}

export type { DebtFormValues };
