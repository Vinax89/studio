'use client'

import { useState, useMemo } from "react"
import { calculateCashflow, type CalculateCashflowOutput } from "@/ai/flows"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, TrendingUp, Scale, Calendar as CalendarIcon, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { showNetworkErrorToast } from "@/lib/network-error"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import {
  getPayPeriodStart,
  calculateOvertimeDates,
  calculatePayPeriodSummary,
  getShiftsInPayPeriod,
  type Shift,
} from "@/lib/payroll"

type ShiftDetails = Omit<Shift, 'date'>;

// Anchor date used to align bi-weekly pay periods for this organization
const payPeriodAnchor = new Date('2024-01-07T00:00:00.000Z');


export default function CashflowPage() {
  const [annualIncome, setAnnualIncome] = useState("")
  const [estimatedTaxes, setEstimatedTaxes] = useState("")
  const [monthlyDeductions, setMonthlyDeductions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cashflowResult, setCashflowResult] = useState<CalculateCashflowOutput | null>(null)
  
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [payPeriod, setPayPeriod] = useState<DateRange | undefined>(undefined);
  const [cursorDate, setCursorDate] = useState(new Date());
  
  const [shiftHours, setShiftHours] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [premiumPay, setPremiumPay] = useState("")
  const [differentials, setDifferentials] = useState("")
  const [lastEnteredShift, setLastEnteredShift] = useState<ShiftDetails | null>(null);

    const { toast } = useToast();

  const overtimeShifts = useMemo(() => calculateOvertimeDates(shifts), [shifts]);

  const payPeriodCalculation = useMemo(
    () => calculatePayPeriodSummary(shifts, payPeriod),
    [shifts, payPeriod]
  );

  const monthlyStats = useMemo(() => {
    const month = cursorDate.getMonth();
    const year = cursorDate.getFullYear();
    const shiftsInMonth = shifts.filter(s => s.date.getMonth() === month && s.date.getFullYear() === year);

    let totalMonthlyIncome = 0;
    let totalMonthlyHours = 0;
    let totalMonthlyOvertimeHours = 0;

    const weeklyShifts: { [weekStart: string]: Shift[] } = {};
    shiftsInMonth.forEach(shift => {
        const shiftDay = shift.date.getDay();
        const weekStart = new Date(shift.date);
        weekStart.setDate(shift.date.getDate() - shiftDay);
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString();
        if (!weeklyShifts[weekStartStr]) weeklyShifts[weekStartStr] = [];
        weeklyShifts[weekStartStr].push(shift);
    });

    for (const weekStartStr in weeklyShifts) {
        const week = weeklyShifts[weekStartStr];
        let weeklyHours = 0;
        let weeklyPremiumPay = 0;
        
        week.forEach(shift => {
            weeklyHours += shift.hours;
            weeklyPremiumPay += shift.premiumPay || 0;
        });

        let regularHours = Math.min(weeklyHours, 40);
        let overtimeHours = Math.max(0, weeklyHours - 40);
        totalMonthlyHours += weeklyHours;
        totalMonthlyOvertimeHours += overtimeHours;
        
        if (week.length > 0) {
            const avgRate = week.reduce((acc, s) => acc + s.rate * s.hours, 0) / weeklyHours;
            const regularPay = regularHours * avgRate;
            const overtimePay = overtimeHours * avgRate * 1.5;
            totalMonthlyIncome += regularPay + overtimePay + weeklyPremiumPay;
        }
    }

    const burnoutIndex = totalMonthlyHours > 0 ? (totalMonthlyOvertimeHours / totalMonthlyHours) * 100 : 0;

    return {
        totalMonthlyIncome,
        totalMonthlyHours,
        burnoutIndex,
    }
  }, [shifts, cursorDate]);


  const shiftsInPayPeriod = useMemo(
    () => getShiftsInPayPeriod(shifts, payPeriod),
    [shifts, payPeriod]
  );

  const handleCashflowSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!annualIncome || !estimatedTaxes || !monthlyDeductions) {
        toast({
            title: "Missing Information",
            description: "Please fill out all fields to calculate your cashflow.",
            variant: "destructive",
        });
      return
    }

    setIsLoading(true)
    setCashflowResult(null)

    try {
      const result = await calculateCashflow({
        annualIncome: parseFloat(annualIncome),
        estimatedAnnualTaxes: parseFloat(estimatedTaxes),
        totalMonthlyDeductions: parseFloat(monthlyDeductions),
      })
      setCashflowResult(result)
    } catch (error) {
      showNetworkErrorToast(error, "There was an error calculating your cashflow. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddShift = (event: React.FormEvent) => {
      event.preventDefault();
      if (!selectedDate || !shiftHours || !hourlyRate) {
          toast({
              title: "Missing Shift Info",
              description: "Please select a date and enter hours and rate.",
              variant: "destructive",
          });
          return;
      }

      const existingShiftIndex = shifts.findIndex(s => s.date.getTime() === selectedDate.getTime());
      
      const newShift: Shift = {
          date: selectedDate,
          hours: parseFloat(shiftHours),
          rate: parseFloat(hourlyRate),
          premiumPay: premiumPay ? parseFloat(premiumPay) : undefined,
          differentials: differentials || undefined,
      };

      if (existingShiftIndex > -1) {
          const updatedShifts = [...shifts];
          updatedShifts[existingShiftIndex] = newShift;
          setShifts(updatedShifts);
      } else {
          setShifts([...shifts, newShift]);
      }
      
      const { date, ...shiftDetails } = newShift;
      setLastEnteredShift(shiftDetails);
  }
  
  const handleDateSelect = (date: Date | undefined) => {
      setSelectedDate(date);
      
      if (date) {
        const start = getPayPeriodStart(date, payPeriodAnchor);
        const end = new Date(start);
        end.setDate(start.getDate() + 13);
        setPayPeriod({ from: start, to: end });

        const existingShift = shifts.find(s => s.date.getTime() === date.getTime());
        if (existingShift) {
            setShiftHours(String(existingShift.hours));
            setHourlyRate(String(existingShift.rate));
            setPremiumPay(existingShift.premiumPay ? String(existingShift.premiumPay) : "");
            setDifferentials(existingShift.differentials || "");
        } else if (lastEnteredShift) {
            // Pre-fill with the last entered shift details
            setShiftHours(String(lastEnteredShift.hours));
            setHourlyRate(String(lastEnteredShift.rate));
            setPremiumPay(lastEnteredShift.premiumPay ? String(lastEnteredShift.premiumPay) : "");
            setDifferentials(lastEnteredShift.differentials || "");
        } else {
            // Clear if no existing shift and no last shift memory
            setShiftHours("");
            setHourlyRate("");
            setPremiumPay("");
            setDifferentials("");
        }
      } else {
        setPayPeriod(undefined);
      }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Cashflow & Shift Planner</h1>
          <p className="text-muted-foreground">Estimate your cashflow and project income from your shifts.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cashflow Calculator</CardTitle>
            <CardDescription>Provide your annual income, estimated annual taxes, and total monthly deductions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCashflowSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                      <Label htmlFor="income">Annual Income</Label>
                      <Input id="income" type="number" placeholder="e.g., 80000" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="taxes">Estimated Annual Taxes</Label>
                      <Input id="taxes" type="number" placeholder="e.g., 12000" value={estimatedTaxes} onChange={(e) => setEstimatedTaxes(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="deductions">Total Monthly Deductions</Label>
                      <Input id="deductions" type="number" placeholder="e.g., 3500" value={monthlyDeductions} onChange={(e) => setMonthlyDeductions(e.target.value)} />
                  </div>
              </div>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
                ) : (
                  <><Wallet className="mr-2 h-4 w-4" /> Calculate Cashflow</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {cashflowResult && (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Cashflow Results</h2>
              <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Gross Monthly Income</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">${cashflowResult.grossMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <p className="text-xs text-muted-foreground">Your total monthly income before taxes and deductions.</p>
                      </CardContent>
                  </Card>
                  <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Net Monthly Cashflow</CardTitle>
                          <Scale className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">${cashflowResult.netMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <p className="text-xs text-muted-foreground">Income remaining after all taxes and deductions.</p>
                      </CardContent>
                  </Card>
              </div>
               <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5" /> Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="leading-relaxed">{cashflowResult.analysis}</p>
                  </CardContent>
              </Card>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> Shift Planner</CardTitle>
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
                        scheduled: "bg-primary/20",
                        payPeriod: "bg-accent text-accent-foreground",
                        overtime: "bg-destructive/20 text-destructive-foreground",
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
                    <p className="text-lg font-bold">${monthlyStats.totalMonthlyIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
                            <Input id="hours" type="number" placeholder="e.g., 12" value={shiftHours} onChange={e => setShiftHours(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate">Hourly Rate ($)</Label>
                            <Input id="rate" type="number" placeholder="e.g., 45.50" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="differentials">Differentials (e.g., Night Shift)</Label>
                            <Input id="differentials" placeholder="e.g., Night, Weekend" value={differentials} onChange={e => setDifferentials(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="premium">Premium Pay (Additional)</Label>
                            <Input id="premium" type="number" placeholder="e.g., 50" value={premiumPay} onChange={e => setPremiumPay(e.target.value)} />
                        </div>
                        <Button type="submit" className="w-full">
                            {shifts.some(s => s.date.getTime() === selectedDate.getTime()) ? 'Update Shift' : 'Add Shift'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )}
        
         {payPeriod && (
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
                                <div className="text-2xl font-bold">${payPeriodCalculation.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <p className="text-xs text-muted-foreground">from {shiftsInPayPeriod.length} shift(s) in this period</p>
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
                                <div key={shift.date.toISOString()} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{shift.date.toLocaleDateString()}</p>
                                        <p className="text-muted-foreground">{shift.hours} hrs @ ${shift.rate}/hr</p>
                                        {shift.differentials && <p className="text-xs text-muted-foreground">({shift.differentials})</p>}
                                    </div>
                                    <div className="font-medium">${((shift.hours * shift.rate) + (shift.premiumPay || 0)).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No shifts added in this pay period yet.</p>
                    )}
                </CardContent>
            </Card>
         )}
      </div>
    </div>
  )
}
