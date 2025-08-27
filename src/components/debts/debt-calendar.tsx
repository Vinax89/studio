"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { Debt } from "@/lib/types"

interface DebtCalendarProps {
    debts: Debt[];
}

export function DebtCalendar({ debts }: DebtCalendarProps) {
    const [month, setMonth] = useState(new Date());

    const getDueDatesForMonth = (year: number, month: number) => {
        return debts.map(debt => {
            return new Date(year, month, debt.dueDate);
        });
    }
    
    const dueDates = getDueDatesForMonth(month.getFullYear(), month.getMonth());

    return (
        <Calendar
            month={month}
            onMonthChange={setMonth}
            modifiers={{ dueDate: dueDates }}
            modifiersClassNames={{
                dueDate: "bg-destructive/20 text-destructive-foreground rounded-full",
            }}
            className="rounded-lg border"
        />
    )
}
