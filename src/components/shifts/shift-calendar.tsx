
"use client"

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Shift } from "@/lib/types"
import { parseISO, isSameDay } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface ShiftCalendarProps {
  shifts: Shift[]
  month: Date
  onMonthChange: (date: Date) => void
}

export function ShiftCalendar({ shifts, month, onMonthChange }: ShiftCalendarProps) {

  const shiftDays = shifts.map(shift => parseISO(shift.date));

  const dayContentRenderer = (day: Date) => {
    const dayShifts = shifts.filter(s => isSameDay(parseISO(s.date), day));
    if (dayShifts.length > 0) {
      return (
        <div className="relative h-full w-full">
            <div className="absolute bottom-1 right-1 flex gap-1">
            {dayShifts.map(shift => (
                <Badge key={shift.id} variant="secondary" className="px-1.5 py-0.5 text-xs">
                    {shift.type.charAt(0)}
                </Badge>
            ))}
            </div>
        </div>
      );
    }
    return null;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>My Shifts</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          modifiers={{
            shift: shiftDays,
          }}
          modifiersClassNames={{
            shift: "bg-primary/20",
          }}
          components={{
            DayContent: ({ date }) => dayContentRenderer(date)
          }}
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
