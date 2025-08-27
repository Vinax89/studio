
"use client"

import { useState } from "react"
import { calculateCashflow, type CalculateCashflowOutput } from "@/ai/flows/calculate-cashflow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, TrendingUp, Scale, Calendar as CalendarIcon, DollarSign, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"

interface Shift {
  date: Date;
  hours: number;
  rate: number;
}

export default function CashflowPage() {
  const [annualIncome, setAnnualIncome] = useState("")
  const [estimatedTaxes, setEstimatedTaxes] = useState("")
  const [monthlyDeductions, setMonthlyDeductions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cashflowResult, setCashflowResult] = useState<CalculateCashflowOutput | null>(null)
  
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [shiftHours, setShiftHours] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")

  const { toast } = useToast();
  
  const totalShiftIncome = shifts.reduce((total, shift) => total + shift.hours * shift.rate, 0);

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
      console.error("Error calculating cashflow:", error)
      toast({
        title: "Calculation Failed",
        description: "There was an error calculating your cashflow. Please try again.",
        variant: "destructive",
      });
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

      // Check if a shift already exists for the selected date
      const existingShiftIndex = shifts.findIndex(s => s.date.getTime() === selectedDate.getTime());
      
      const newShift: Shift = {
          date: selectedDate,
          hours: parseFloat(shiftHours),
          rate: parseFloat(hourlyRate)
      };

      if (existingShiftIndex > -1) {
          // Update existing shift
          const updatedShifts = [...shifts];
          updatedShifts[existingShiftIndex] = newShift;
          setShifts(updatedShifts);
      } else {
          // Add new shift
          setShifts([...shifts, newShift]);
      }
      
      // Clear form
      setShiftHours("");
      setHourlyRate("");
  }
  
  const handleDateSelect = (date: Date | undefined) => {
      setSelectedDate(date);
      if (date) {
        const existingShift = shifts.find(s => s.date.getTime() === date.getTime());
        if (existingShift) {
            setShiftHours(String(existingShift.hours));
            setHourlyRate(String(existingShift.rate));
        } else {
            setShiftHours("");
            setHourlyRate("");
        }
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
                      <CardDescription>A brief summary of your cashflow situation.</CardDescription>
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
                <CardDescription>Select a date to add or edit a shift.</CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    modifiers={{ scheduled: shifts.map(s => s.date) }}
                    modifiersClassNames={{ scheduled: "bg-primary/20" }}
                    className="p-0"
                />
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
                        <Button type="submit" className="w-full">
                            {shifts.some(s => s.date.getTime() === selectedDate.getTime()) ? 'Update Shift' : 'Add Shift'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )}
        
         <Card>
            <CardHeader>
                <CardTitle>Shift Summary</CardTitle>
                <CardDescription>A list of your scheduled shifts.</CardDescription>
            </CardHeader>
            <CardContent>
                {shifts.length > 0 ? (
                  <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Estimated Shift Income</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalShiftIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <p className="text-xs text-muted-foreground">from {shifts.length} shift(s)</p>
                        </CardContent>
                    </Card>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {shifts.sort((a,b) => a.date.getTime() - b.date.getTime()).map(shift => (
                            <div key={shift.date.toISOString()} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                                <div>
                                    <p className="font-semibold">{shift.date.toLocaleDateString()}</p>
                                    <p className="text-muted-foreground">{shift.hours} hrs @ ${shift.rate}/hr</p>
                                </div>
                                <div className="font-medium">${(shift.hours * shift.rate).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                  </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No shifts added yet. Select a date on the calendar to begin.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

    