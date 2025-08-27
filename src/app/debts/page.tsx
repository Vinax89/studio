
"use client"

import { useState } from "react";
import { mockDebts } from "@/lib/data";
import type { Debt } from "@/lib/types";
import { DebtCalendar } from "@/components/debts/debt-calendar";
import { DebtList } from "@/components/debts/debt-list";
import { AddDebtDialog } from "@/components/debts/add-debt-dialog";
import { DebtDetails } from "@/components/debts/debt-details";


export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    setDebts(prev => [
      { ...debt, id: (prev.length + 1).toString() },
      ...prev
    ]);
  };

  const debtsForSelectedDay = selectedDate ? debts.filter(d => new Date(selectedDate).getDate() === d.dueDate) : [];


  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Debt Tracker</h1>
            <p className="text-muted-foreground">Manage your debts and visualize your payment schedule.</p>
        </div>
        <AddDebtDialog onSave={addDebt} />
      </div>
        <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <DebtCalendar 
                    debts={debts} 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                />
            </div>
            <div className="space-y-6 lg:col-span-2">
                <DebtDetails date={selectedDate} debts={debtsForSelectedDay} />
                <DebtList debts={debts} />
            </div>
        </div>
    </div>
  );
}
