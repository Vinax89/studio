"use client"

import React from "react";
import { DayPicker, type DateFormatter } from "react-day-picker";
import "react-day-picker/dist/style.css";
import type { Debt } from "@/lib/types";
import { isSameDay, isAfter, startOfMonth, format } from 'date-fns';

interface DebtCalendarProps {
    debts: Debt[];
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

const formatCaption: DateFormatter = (month, options) => {
    return <>{format(month, 'LLLL yyyy', { locale: options?.locale })}</>;
};

export function DebtCalendar({ debts, selectedDate, onDateSelect }: DebtCalendarProps) {

  const debtsDueModifier = debts.flatMap(debt => {
    const dueDate = new Date(debt.dueDate + 'T00:00:00');
    if (debt.recurrence === 'monthly') {
      // This is a simplified logic. For a real app, you'd generate all occurrences.
      // For this example, we'll just mark the day of the month.
      // A more robust solution would be needed for multi-month views.
      return { dayOfMonth: dueDate.getDate() };
    }
    return dueDate;
  });

  const modifiers = {
    due: (date: Date) => {
      return debts.some(debt => {
        const startDate = new Date(debt.dueDate + 'T00:00:00');
        if (debt.recurrence === 'monthly') {
          return startDate.getDate() === date.getDate() && !isAfter(startOfMonth(startDate), date);
        }
        return isSameDay(startDate, date);
      });
    }
  };
  
  const modifiersStyles = {
    due: { 
        position: 'relative',
        overflow: 'visible',
    }
  };

  const footer = (
      <div className="text-center text-sm text-muted-foreground mt-4">
        <span className="inline-block h-2 w-2 bg-primary rounded-full mr-2"></span>
        Indicates a payment is due.
      </div>
  )

  return (
      <DayPicker
        showOutsideDays
        className="rounded-lg border w-full p-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "w-full space-y-4 p-4",
          caption: "flex justify-center pt-1 relative items-center mb-4",
          caption_label: "text-lg font-bold",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex justify-around",
          head_cell: "text-muted-foreground rounded-md w-full font-bold text-sm",
          row: "flex w-full mt-2 justify-around",
          cell: "h-16 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: "h-16 w-full p-0 font-normal aria-selected:opacity-100 text-base rounded-md focus:bg-accent",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
          modifier_due: "text-primary-foreground",
        }}
        modifiers={modifiers}
        modifiersClassNames={{
            due: "due-date-modifier"
        }}
        selected={selectedDate}
        onSelect={onDateSelect}
        formatters={{ formatCaption }}
        footer={footer}
      />
  );
}

