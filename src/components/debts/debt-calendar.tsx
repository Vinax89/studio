
"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import type { Debt } from "@/lib/types"
import { addMonths, isSameDay } from "date-fns"

interface DebtCalendarProps {
    debts: Debt[];
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

export function DebtCalendar({ debts, selectedDate, onDateSelect }: DebtCalendarProps) {
    const [month, setMonth] = useState(new Date());

    const getDueDatesForMonth = (year: number, month: number) => {
        const dueDatesMap = new Map<string, number>();

        debts.forEach(debt => {
            let startDate = new Date(debt.dueDate);
            // Adjust for timezone differences by creating date in UTC
            startDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());

            if (debt.recurrence === 'monthly') {
                let currentDate = startDate;
                while (currentDate.getFullYear() < year || (currentDate.getFullYear() === year && currentDate.getMonth() <= month)) {
                    if (currentDate.getFullYear() === year && currentDate.getMonth() === month) {
                         const dayKey = currentDate.toISOString().split('T')[0];
                         dueDatesMap.set(dayKey, (dueDatesMap.get(dayKey) || 0) + 1);
                    }
                    currentDate = addMonths(currentDate, 1);
                }
            } else { // 'once'
                 if (startDate.getFullYear() === year && startDate.getMonth() === month) {
                    const dayKey = startDate.toISOString().split('T')[0];
                    dueDatesMap.set(dayKey, (dueDatesMap.get(dayKey) || 0) + 1);
                }
            }
        });
        return dueDatesMap;
    }
    
    const dueDatesMap = getDueDatesForMonth(month.getFullYear(), month.getMonth());
    const dueDates = Array.from(dueDatesMap.keys()).map(key => new Date(key + 'T00:00:00'));


    const DayContent = ({ date }: { date: Date }) => {
        const matchingKey = Array.from(dueDatesMap.keys()).find(key => isSameDay(new Date(key + 'T00:00:00'), date))
        const count = matchingKey ? dueDatesMap.get(matchingKey) : 0;
        
        return (
            <div className="relative h-full w-full flex items-center justify-center">
                {date.getDate()}
                {count > 0 && (
                    <div className="absolute bottom-1.5 flex justify-center items-end h-2 space-x-0.5">
                        {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
                             <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex justify-center">
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
                    month: 'w-full space-y-4 p-4',
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
                    DayContent: DayContent
                }}
            />
        </div>
    )
}
