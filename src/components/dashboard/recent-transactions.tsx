"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5)
  const { t } = useTranslation()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("transactions.recent")}</CardTitle>
        <CardDescription>{t("transactions.recentDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-4">
            <Avatar className="hidden h-11 w-11 sm:flex">
                <AvatarFallback className={cn(
                    transaction.type === 'Income' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
                )}>
                    {transaction.type === 'Income' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="font-medium leading-none">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>
            <div className={cn(
                "ml-auto font-semibold",
                transaction.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            )}>
              {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
