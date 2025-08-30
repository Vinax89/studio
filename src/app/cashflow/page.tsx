'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Calendar as CalendarIcon } from 'lucide-react'
import CashflowCalculator from './CashflowCalculator'
import PayPeriodSummary from './PayPeriodSummary'
import { useShifts } from '@/hooks/use-shifts'

export default function CashflowPage() {
  const {
    shifts,
    selectedDate,
    payPeriod,
    cursorDate,
    setCursorDate,
    shiftHours,
    setShiftHours,
    hourlyRate,
    setHourlyRate,
    premiumPay,
    setPremiumPay,
    differentials,
    setDifferentials,
    handleAddShift,
    handleDateSelect,
    overtimeShifts,
    monthlyStats,
  } = useShifts()

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Cashflow & Shift Planner</h1>
          <p className="text-muted-foreground">Estimate your cashflow and project income from your shifts.</p>
        </div>

        <CashflowCalculator />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" /> Shift Planner
            </CardTitle>
            <CardDescription>Select a date to highlight a pay period and add shifts.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={cursorDate}
              onMonthChange={setCursorDate}
              modifiers={{
                scheduled: shifts.map(s => s.date),
                payPeriod: payPeriod || {},
                overtime: overtimeShifts,
              }}
              modifiersClassNames={{
                scheduled: 'bg-primary/20',
                payPeriod: 'bg-accent text-accent-foreground',
                overtime: 'bg-destructive/20 text-destructive-foreground',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
            <CardDescription>
              Analysis for {cursorDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Est. Income</p>
              <p className="text-lg font-bold">
                ${monthlyStats.totalMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-lg font-bold">{monthlyStats.totalMonthlyHours.toFixed(1)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Burnout Index</p>
              <p className="text-lg font-bold">{monthlyStats.burnoutIndex.toFixed(1)}% OT</p>
            </div>
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>Shift Details for {selectedDate.toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddShift} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Shift Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    placeholder="e.g., 12"
                    value={shiftHours}
                    onChange={e => setShiftHours(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="e.g., 45.50"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="differentials">Differentials (e.g., Night Shift)</Label>
                  <Input
                    id="differentials"
                    placeholder="e.g., Night, Weekend"
                    value={differentials}
                    onChange={e => setDifferentials(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premium">Premium Pay (Additional)</Label>
                  <Input
                    id="premium"
                    type="number"
                    placeholder="e.g., 50"
                    value={premiumPay}
                    onChange={e => setPremiumPay(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {shifts.some(s => s.date.getTime() === selectedDate.getTime())
                    ? 'Update Shift'
                    : 'Add Shift'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <PayPeriodSummary payPeriod={payPeriod} shifts={shifts} />
      </div>
    </div>
  )
}
