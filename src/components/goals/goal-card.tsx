import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Goal } from "@/lib/types"

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.name}</CardTitle>
        <CardDescription>Deadline: {new Date(goal.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
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
