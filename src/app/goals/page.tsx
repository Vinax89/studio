"use client"

import { useEffect, useState } from "react";
import type { Goal } from "@/lib/types";
import { GoalCard } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, initFirebase } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";

initFirebase();

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const snap = await getDocs(collection(db, "goals"));
        const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Goal, "id">) })) as Goal[];
        setGoals(data);
      } catch (err) {
        logger.error("Error fetching goals:", err);
        setError("Failed to load goals");
        toast({
          title: "Failed to load goals",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, [toast]);

  const handleSaveGoal = async (goal: Goal) => {
    try {
      if (goal.id) {
        await updateDoc(doc(db, "goals", goal.id), {
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          importance: goal.importance,
        });
        setGoals(prev => prev.map(g => (g.id === goal.id ? goal : g)));
        toast({ title: "Goal Updated" });
      } else {
        const docRef = await addDoc(collection(db, "goals"), {
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          deadline: goal.deadline,
          importance: goal.importance,
        });
        setGoals(prev => [{ ...goal, id: docRef.id }, ...prev]);
        toast({ title: "Goal Added" });
      }
    } catch (err) {
      logger.error("Error saving goal:", err);
      toast({
        title: "Failed to save goal",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "goals", id));
      setGoals(prev => prev.filter(g => g.id !== id));
      toast({ title: "Goal Deleted" });
    } catch (err) {
      logger.error("Error deleting goal:", err);
      toast({
        title: "Failed to delete goal",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
            <p className="text-muted-foreground">Set and track your financial goals to stay motivated.</p>
        </div>
        <AddGoalDialog onSave={handleSaveGoal} />
      </div>
      {error && <p className="text-destructive">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onUpdate={handleSaveGoal} />
        ))}
      </div>
    </div>
  );
}
