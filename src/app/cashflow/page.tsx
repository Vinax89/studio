
"use client"

import { useState } from "react"
import { calculateCashflow, type CalculateCashflowOutput } from "@/ai/flows/calculate-cashflow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Wallet, TrendingUp, TrendingDown, Scale, Calendar as CalendarIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"

export default function CashflowPage() {
  const [annualIncome, setAnnualIncome] = useState("")
  const [estimatedTaxes, setEstimatedTaxes] = useState("")
  const [monthlyDeductions, setMonthlyDeductions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [cashflowResult, setCashflowResult] = useState<CalculateCashflowOutput | null>(null)
  const [dates, setDates] = useState<Date[] | undefined>([])
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
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
  
  const today = new Date();

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Cashflow Calculator</h1>
          <p className="text-muted-foreground">Estimate your net and gross monthly cashflow.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Your Financials</CardTitle>
            <CardDescription>Provide your annual income, estimated annual taxes, and total monthly deductions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <CardDescription>Select dates on the calendar to mark your shifts. This is a visual tool to help you plan.</CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="multiple"
                    selected={dates}
                    onSelect={setDates}
                    className="p-0"
                    classNames={{
                        month: "space-y-4 w-full",
                        table: "w-full border-collapse",
                        head_row: "flex justify-between w-full",
                        row: "flex w-full mt-2 justify-between",
                    }}
                    defaultMonth={today}
                />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Shift Details</CardTitle>
                <CardDescription>Summary of your selected shifts.</CardDescription>
            </CardHeader>
            <CardContent>
                {dates && dates.length > 0 ? (
                    <div className="space-y-2">
                        <p className="font-semibold">{dates.length} shift(s) selected.</p>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground">
                            {dates.sort((a,b) => a.getTime() - b.getTime()).map(date => (
                                <li key={date.toISOString()}>{date.toLocaleDateString()}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No shifts selected yet. Click on dates in the calendar to add them.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
