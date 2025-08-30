import { z } from "zod";
import { RecurrenceValues } from "./types";

const numberField = z
  .coerce.number()
  .refine((v) => !Number.isNaN(v), { message: "Required" });

export const DebtFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  initialAmount: numberField.refine((v) => v >= 0, { message: "Initial amount must be ≥ 0" }),
  currentAmount: numberField.refine((v) => v >= 0, { message: "Current amount must be ≥ 0" }),
  interestRate: numberField,
  minimumPayment: numberField.refine((v) => v > 0, { message: "Minimum payment must be greater than 0" }),
  dueDate: z
    .string({ required_error: "Due date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date is required"),
  recurrence: z.enum(RecurrenceValues),
  autopay: z.boolean(),
  notes: z.string().optional(),
  color: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof DebtFormSchema>;
