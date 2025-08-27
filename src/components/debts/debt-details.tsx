
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Debt } from "@/lib/types"
import { CalendarIcon } from "lucide-react"

interface DebtDetailsProps {
    date: Date | undefined;
    debts: Debt[];
}

export function DebtDetails({ date, debts }: DebtDetailsProps) {
    if (!date) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Due Payments</CardTitle>
                     <CardDescription>Select a day to see what's due.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                        <CalendarIcon className="h-10 w-10 mb-4" />
                        <p>Select a day on the calendar.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Dues for {date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </CardTitle>
                <CardDescription>
                    {debts.length > 0 ? `You have ${debts.length} payment(s) due.` : "No payments due on this day."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {debts.length > 0 ? (
                    debts.map(debt => (
                         <div key={debt.id} className="flex justify-between items-center">
                            <span className="font-medium">{debt.name}</span>
                            <span className="font-semibold text-primary">${debt.minimumPayment.toLocaleString()}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">You can rest easy!</p>
                )}
            </CardContent>
        </Card>
    )
}
