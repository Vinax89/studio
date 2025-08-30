'use client'

import { useMemo } from 'react'
import type { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, Clock } from 'lucide-react'
import { calculatePayPeriodSummary, getShiftsInPayPeriod, type Shift } from '@/lib/payroll'

interface PayPeriodSummaryProps {
  payPeriod: DateRange | undefined
  shifts: Shift[]
}

export default function PayPeriodSummary({ payPeriod, shifts }: PayPeriodSummaryProps) {
  const shiftsInPayPeriod = useMemo(
    () => getShiftsInPayPeriod(shifts, payPeriod),
    [shifts, payPeriod]
  )
  const payPeriodCalculation = useMemo(
    () => calculatePayPeriodSummary(shifts, payPeriod),
    [shifts, payPeriod]
  )

  if (!payPeriod) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Period Summary</CardTitle>
        {payPeriod.from && payPeriod.to && (
          <CardDescription>
            {payPeriod.from.toLocaleDateString()} - {payPeriod.to.toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {shiftsInPayPeriod.length > 0 ? (
          <div className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${payPeriodCalculation.totalIncome.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  from {shiftsInPayPeriod.length} shift(s) in this period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hours Breakdown</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span>Regular Hours:</span> <span>{payPeriodCalculation.regularHours.toFixed(2)}</span></div>
                  <div className="flex justify-between font-semibold text-primary"><span>Overtime Hours:</span> <span>{payPeriodCalculation.overtimeHours.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold"><span>Total Hours:</span> <span>{payPeriodCalculation.totalHours.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {shiftsInPayPeriod.map(shift => (
                <div
                  key={shift.date.toISOString()}
                  className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50"
                >
                  <div>
                    <p className="font-semibold">{shift.date.toLocaleDateString()}</p>
                    <p className="text-muted-foreground">{shift.hours} hrs @ ${shift.rate}/hr</p>
                    {shift.differentials && (
                      <p className="text-xs text-muted-foreground">({shift.differentials})</p>
                    )}
                  </div>
                  <div className="font-medium">
                    ${((shift.hours * shift.rate) + (shift.premiumPay || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No shifts added in this pay period yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
