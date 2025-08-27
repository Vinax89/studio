
"use client"

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { DebtCalendar } from "@/components/debts/DebtCalendar";
import { mockDebts } from "@/lib/data";
import { DebtCard } from "@/components/debts/debt-card";
import { DebtStrategyPlan } from "@/components/debts/debt-strategy-plan";
import { Button } from "@/components/ui/button";
import { suggestDebtStrategy, type SuggestDebtStrategyOutput } from "@/ai/flows/suggest-debt-strategy";
import { useToast } from "@/hooks/use-toast";
import type { Debt } from "@/lib/types";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(mockDebts);
  const [strategy, setStrategy] = useState<SuggestDebtStrategyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetStrategy = async () => {
    if (debts.length === 0) {
      toast({
        title: "No Debts Found",
        description: "Please add at least one debt to get a strategy.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    setStrategy(null);
    try {
      // The AI flow expects the full debt details, which we have in the `debts` state.
      // The `mockDebts` in the AI flow's Zod schema is just for type definition, not for data.
      const result = await suggestDebtStrategy({ debts });
      setStrategy(result);
    } catch (error) {
      console.error("Error suggesting debt strategy:", error);
      toast({
        title: "Strategy Failed",
        description: "There was an error generating your debt strategy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateDebt = (updatedDebt: Debt) => {
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Debt Management</h1>
        <p className="text-muted-foreground">Use the calendar to track due dates, and get an AI-powered plan to become debt-free.</p>
      </div>

      <DebtCalendar storageKey="nursefinai.debts" initialDebts={debts} onChange={setDebts} />
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg">
          <div>
            <h2 className="text-xl font-bold">AI-Powered Payoff Plan</h2>
            <p className="text-muted-foreground">Let our AI analyze your debts and suggest the optimal payoff strategy.</p>
          </div>
          <Button onClick={handleGetStrategy} disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get AI Payoff Plan
              </>
            )}
          </Button>
        </div>

        {strategy && <DebtStrategyPlan strategy={strategy} />}
      </div>
      
      <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Your Debts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {debts.map(debt => (
                <DebtCard 
                  key={debt.id} 
                  debt={debt} 
                  onDelete={handleDeleteDebt}
                  onUpdate={handleUpdateDebt}
                />
              ))}
          </div>
      </div>
    </div>
  );
}
