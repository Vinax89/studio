
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/lib/types";
import { Badge } from "../ui/badge";
import { AddGoalDialog } from "./add-goal-dialog";

interface GoalCardProps {
  goal: Goal;
  onDelete: (id: string) => Promise<void> | void;
  onUpdate: (goal: Goal) => Promise<void> | void;
}

export function GoalCard({ goal, onDelete, onUpdate }: GoalCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(goal.id);
    setIsDeleting(false);
  };

  const importanceMap: {[key: number]: string} = {
      1: "Very Low",
      2: "Low",
      3: "Medium",
      4: "High",
      5: "Very High"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{goal.name}</CardTitle>
                <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
            </div>
            <Badge variant={goal.importance > 3 ? "default" : "secondary"}>
                {importanceMap[goal.importance]}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex justify-between font-medium text-muted-foreground">
            <span>Progress</span>
            <span className="text-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} aria-label={`${goal.name} progress`} />
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <p className="text-muted-foreground">
            <span className="font-bold text-foreground">${goal.currentAmount.toLocaleString()}</span> of ${goal.targetAmount.toLocaleString()}
        </p>
        <div className="flex gap-2">
          <AddGoalDialog
            goal={goal}
            onSave={onUpdate}
            trigger={<Button variant="ghost" size="sm">Edit</Button>}
          />
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
