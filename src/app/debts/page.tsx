
"use client"

import DebtCalendar from "@/components/debts/DebtCalendar";
import { mockDebts } from "@/lib/data";


export default function DebtsPage() {

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Debt Calendar</h1>
            <p className="text-muted-foreground">Manage your debts, visualize your payoff journey, and get an AI-powered plan.</p>
        </div>
      </div>
      
      <DebtCalendar storageKey="nursefinai.debts" initialDebts={mockDebts} onChange={(debts)=>{/* sync to your store */}} />
    </div>
  );
}
