
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Goal } from "@/lib/types"
import { Badge } from "../ui/badge";

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

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
      <CardFooter>
        <p className="text-muted-foreground">
            <span className="font-bold text-foreground">${goal.currentAmount.toLocaleString()}</span> of ${goal.targetAmount.toLocaleString()}
        </p>
      </CardFooter>
    </Card>
  )
}
