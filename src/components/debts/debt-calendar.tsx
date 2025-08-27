
"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { Debt } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DebtCalendarProps {
    debts: Debt[];
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

export function DebtCalendar({ debts, selectedDate, onDateSelect }: DebtCalendarProps) {
    const [month, setMonth] = useState(new Date());

    const getDueDatesForMonth = (year: number, month: number) => {
        return debts.map(debt => {
            return new Date(year, month, debt.dueDate);
        });
    }
    
    const dueDates = getDueDatesForMonth(month.getFullYear(), month.getMonth());

    const DayContent = (day: Date) => {
        const isDueDate = dueDates.some(d => d.getTime() === day.getTime());
        return (
            <div className="relative h-full w-full flex items-center justify-center">
                {day.getDate()}
                {isDueDate && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
            </div>
        )
    }

    return (
        <Calendar
            month={month}
            onMonthChange={setMonth}
            selected={selectedDate}
            onSelect={onDateSelect}
            modifiers={{ dueDate: dueDates }}
            modifiersClassNames={{
                dueDate: "font-bold",
            }}
            className="rounded-lg border"
            components={{
                DayContent: ({ date }) => DayContent(date)
            }}
        />
    )
}
