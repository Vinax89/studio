
"use client"

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
const DebtCalendar = dynamic(() => import("@/components/debts/DebtCalendar"), { ssr: false });
import { DebtCard } from "@/components/debts/debt-card";
import { DebtStrategyPlan } from "@/components/debts/debt-strategy-plan";
import { Button } from "@/components/ui/button";
import { suggestDebtStrategy, type SuggestDebtStrategyOutput } from "@/ai/flows";
import { useToast } from "@/hooks/use-toast";
import type { Debt } from "@/lib/types";
import { deleteDoc } from "firebase/firestore";
import { debtDoc } from "@/lib/debts";
import { logger } from "@/lib/logger";

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
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
      // The AI flow expects the full debt details, which our unified `Debt` type now provides.
      const result = await suggestDebtStrategy({ debts });
      setStrategy(result);

    } catch (error) {
      logger.error("Error suggesting debt strategy:", error);
      toast({
        title: "Strategy Failed",
        description: "There was an error generating your debt strategy. Please try again.",
       variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    await deleteDoc(debtDoc(id));
    toast({ title: "Debt Deleted" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Debt Management</h1>
        <p className="text-muted-foreground">Use the calendar to track due dates, and get an AI-powered plan to become debt-free.</p>
      </div>

      <DebtCalendar onChange={setDebts} />
      
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
          {debts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {debts.map(debt => (
                  <DebtCard 
                    key={debt.id} 
                    debt={debt} 
                    onDelete={() => handleDeleteDebt(debt.id)}
                    onUpdate={(updatedDebt) => { 
                       /* This would trigger an edit form */
                       const debtIndex = debts.findIndex(d => d.id === updatedDebt.id);
                       const newDebts = [...debts];
                       if (debtIndex > -1) {
                         newDebts[debtIndex] = updatedDebt;
                         setDebts(newDebts);
                       }
                     }}
                  />
                ))}
            </div>
          ) : (
             <p className="text-muted-foreground">You haven't added any debts yet. Add one in the calendar to get started.</p>
          )}
      </div>
    </div>
  );
}
