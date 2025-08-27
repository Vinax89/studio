"use client"

import { useState } from "react";
import { mockGoals } from "@/lib/data";
import type { Goal } from "@/lib/types";
import { GoalCard } from "@/components/goals/goal-card";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  const addGoal = (goal: Omit<Goal, 'id'>) => {
    setGoals(prev => [
      { ...goal, id: (prev.length + 1).toString() },
      ...prev
    ]);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
            <p className="text-muted-foreground">Set and track your financial goals to stay motivated.</p>
        </div>
        <AddGoalDialog onSave={addGoal} />
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
}
