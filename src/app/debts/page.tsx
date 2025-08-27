"use client"

import { useState } from "react";
import { mockDebts } from "@/lib/data";
import type { Debt } from "@/lib/types";
import { AddDebtDialog } from "@/components/debts/add-debt-dialog";
import { DebtCard } from "@/components/debts/debt-card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { suggestDebtStrategy, SuggestDebtStrategyOutput } from "@/ai/flows/suggest-debt-strategy";
import { AIPayoffPlan } from "@/components/debts/ai-payoff-plan";
import { useToast } from "@/hooks/use-toast";
import { DebtCalendar } from "@/components/debts/debt-calendar";
import { DebtDetails } from "@/components/debts/debt-details";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [strategy, setStrategy] = useState<SuggestDebtStrategyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    setDebts(prev => [
      { ...debt, id: (prev.length + 1).toString() },
      ...prev
    ]);
  };

  const handleGetStrategy = async () => {
    setIsLoading(true);
    setStrategy(null);
    try {
      const result = await suggestDebtStrategy({ debts });
      setStrategy(result);
    } catch (error) {
       console.error("Error getting debt strategy:", error);
       toast({
         title: "Strategy Generation Failed",
         description: "There was an error generating your debt payoff plan. Please try again.",
         variant: "destructive",
       });
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Debt Tracker</h1>
            <p className="text-muted-foreground">Manage your debts, visualize your payoff journey, and get an AI-powered plan.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={handleGetStrategy} disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? "Analyzing..." : "Get AI Payoff Plan"}
            </Button>
            <AddDebtDialog onSave={addDebt} />
        </div>
      </div>
      
      {strategy && <AIPayoffPlan strategy={strategy} />}

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <DebtCalendar 
                debts={debts}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />
        </div>
        <div className="md:col-span-1">
            <DebtDetails
                debts={debts}
                selectedDate={selectedDate}
            />
        </div>
      </div>


      <div className="space-y-4">
         <h2 className="text-2xl font-bold tracking-tight">Your Debt Accounts</h2>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {debts.map(debt => (
                <DebtCard key={debt.id} debt={debt} />
            ))}
        </div>
      </div>

    </div>
  );
}
