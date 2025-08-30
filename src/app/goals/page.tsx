"use client"

import { useEffect, useState } from "react";
import type { Goal } from "@/lib/types";
import { GoalCard } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const snap = await getDocs(collection(db, "goals"));
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Goal, "id">) })) as Goal[];
      setGoals(data);
    };
    fetchGoals();
  }, []);

  const handleSaveGoal = async (goal: Goal) => {
    if (goal.id) {
      await updateDoc(doc(db, "goals", goal.id), {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        importance: goal.importance,
      });
      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    } else {
      const docRef = await addDoc(collection(db, "goals"), {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        importance: goal.importance,
      });
      setGoals(prev => [{ ...goal, id: docRef.id }, ...prev]);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteDoc(doc(db, "goals", id));
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
            <p className="text-muted-foreground">Set and track your financial goals to stay motivated.</p>
        </div>
        <AddGoalDialog onSave={handleSaveGoal} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} onUpdate={handleSaveGoal} />
        ))}
      </div>
    </div>
  );
}
