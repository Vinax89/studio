import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { mockTransactions } from "@/lib/data"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export default function RecentTransactions() {
  const recentTransactions = mockTransactions.slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your 5 most recent transactions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback className={cn(
                    transaction.type === 'Income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
                    'dark:bg-transparent'
                )}>
                    {transaction.type === 'Income' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>
            <div className={cn(
                "ml-auto font-medium",
                transaction.type === 'Income' ? 'text-green-600' : 'text-red-600',
                 'dark:text-primary-foreground'
            )}>
              {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
