"use client"

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import type { Debt } from "@/lib/types";
import { eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, addMonths, getDay, isAfter } from 'date-fns';

interface DebtCalendarProps {
    debts: Debt[];
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

const Dot = () => <div className="h-1.5 w-1.5 bg-primary rounded-full" />;

export function DebtCalendar({ debts, selectedDate, onDateSelect }: DebtCalendarProps) {

  const getDueDatesForMonth = (month: Date) => {
    const dates: Date[] = [];
    debts.forEach(debt => {
      if (debt.recurrence === 'once') {
        const dueDate = new Date(debt.dueDate + 'T00:00:00');
        if (isSameDay(startOfMonth(dueDate), month)) {
          dates.push(dueDate);
        }
      } else { // monthly
        const startDate = new Date(debt.dueDate + 'T00:00:00');
        if (!isAfter(startOfMonth(month), startDate)) {
            let recurringDate = new Date(startDate);
            recurringDate.setMonth(month.getMonth());
            recurringDate.setFullYear(month.getFullYear());
            dates.push(recurringDate);
        }
      }
    });
    return dates;
  }

  const CustomDay = ({ date }: { date: Date }) => {
    const debtsDueOnDay = debts.filter(debt => {
         const startDate = new Date(debt.dueDate + 'T00:00:00');
         if (debt.recurrence === 'monthly') {
             return startDate.getDate() === date.getDate() && !isAfter(date, startDate);
         }
         return isSameDay(startDate, date);
    });

    return (
        <div className="relative flex flex-col items-center justify-center h-full w-full">
            <span>{date.getDate()}</span>
            {debtsDueOnDay.length > 0 && 
                <div className="absolute bottom-1 flex space-x-1">
                    {debtsDueOnDay.slice(0, 3).map((_, i) => <Dot key={i} />)}
                </div>
            }
        </div>
    );
  };


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
        cell: "h-16 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-16 w-full p-0 font-normal aria-selected:opacity-100 text-base",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        day_today: "bg-accent text-accent-foreground rounded-md",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
      }}
      components={{
          Day: CustomDay
      }}
      selected={selectedDate}
      onSelect={onDateSelect}
    />
  );
}
