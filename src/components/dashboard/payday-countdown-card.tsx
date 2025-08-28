"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { getNextPayDay } from "@/lib/payroll"

export default function PaydayCountdownCard() {
  const today = new Date()
  const nextPayDay = getNextPayDay(today)

  const startOfToday = new Date(today)
  startOfToday.setHours(0, 0, 0, 0)
  const diffMs = nextPayDay.getTime() - startOfToday.getTime()
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  const message = daysRemaining === 0 ? "It's pay day!" : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Pay Day</CardTitle>
        <CardDescription>{nextPayDay.toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{message}</div>
      </CardContent>
    </Card>
  )
}
