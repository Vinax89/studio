
"use client"

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { mockDebts } from "@/lib/data";
import { DebtCard } from "@/components/debts/debt-card";
import { DebtStrategyPlan } from "@/components/debts/debt-strategy-plan";
import { Button } from "@/components/ui/button";
import { suggestDebtStrategy, type SuggestDebtStrategyOutput } from "@/ai/flows/suggest-debt-strategy";
import { useToast } from "@/hooks/use-toast";
import type { Debt } from "@/lib/types";

const DebtCalendar = dynamic(() => import("@/components/debts/DebtCalendar"), { ssr: false });

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
      // The AI flow expects the full debt details.
      // The `suggestDebtStrategy` flow needs `initialAmount` and `currentAmount` which are not in the calendar's `Debt` type.
      // We will map the calendar debt type to the type expected by the flow.
      const strategyInput = debts.map(d => ({
        id: d.id,
        name: d.name,
        // The calendar 'amount' is the payment. We need total amounts. Let's use placeholder values for now.
        // For a real app, these would be part of the Debt model.
        initialAmount: d.amount * 12 * 5, // Placeholder
        currentAmount: d.amount * 12 * 3, // Placeholder
        interestRate: 5, // Placeholder
        minimumPayment: d.amount,
        dueDate: d.dueDate,
        recurrence: d.recurrence as 'once' | 'monthly', // Type assertion
      }));

      // The current calendar debt type doesn't match the one needed for the AI strategy.
      // This is a placeholder to show the UI. A full implementation would require merging the Debt types.
       toast({
         title: "Feature Under Development",
         description: "The AI strategy requires more debt details (like total amount and interest rate) which are not yet captured in the calendar. This is a placeholder UI.",
       });
       // Silently fail for now, just to show UI
       // const result = await suggestDebtStrategy({ debts: strategyInput });
       // setStrategy(result);
       setStrategy({
           recommendedStrategy: 'avalanche',
           strategyReasoning: 'The avalanche method is recommended to save the most on interest by paying off the highest-rate debts first.',
           payoffOrder: debts.map((d,i) => ({ debtName: d.name, priority: i + 1})),
           summary: 'This is a placeholder strategy. Focus on your highest interest debts to save money.'
       })


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
    // This should be handled by the calendar's internal logic and propagated via onChange
    // For now, we will just update the local state to show it can be done.
    setDebts(prev => prev.filter(d => d.id !== id));
    toast({ title: "Debt Deleted", description: "This is a visual demo. The calendar has its own state."})
  };

  const handleUpdateDebt = (updatedDebt: Debt) => {
     // This should be handled by the calendar's internal logic and propagated via onChange
    setDebts(prev => prev.map(d => d.id === updatedDebt.id ? updatedDebt : d));
    toast({ title: "Debt Updated", description: "This is a visual demo. The calendar has its own state."})
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
                  debt={{
                      ...debt,
                      // These fields are missing from the calendar debt type, so we add them for the card
                      initialAmount: debt.amount * 12 * 5, // Placeholder
                      currentAmount: debt.amount * 12 * 3, // Placeholder
                      interestRate: 5.5, // Placeholder
                      minimumPayment: debt.amount,
                  }} 
                  onDelete={() => handleDeleteDebt(debt.id)}
                  onUpdate={() => { /* This would trigger an edit form */}}
                />
              ))}
          </div>
      </div>
    </div>
  );
}
