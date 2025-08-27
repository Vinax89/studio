
"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { Debt } from "@/lib/types"

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
        const isDueDate = dueDates.some(d => d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear());
        return (
            <div className="relative h-full w-full flex items-center justify-center">
                {day.getDate()}
                {isDueDate && <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary" />}
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
                dueDate: "font-bold text-primary",
            }}
            className="rounded-lg border w-full p-0"
            classNames={{
              month: 'w-full space-y-4',
              table: 'w-full border-collapse space-y-1',
              head_row: "flex justify-around",
              head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
              row: "flex w-full mt-2 justify-around",
              cell: "h-16 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-16 w-full p-0 font-normal aria-selected:opacity-100",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
            }}
            components={{
                DayContent: ({ date }) => DayContent(date)
            }}
        />
    )
}
