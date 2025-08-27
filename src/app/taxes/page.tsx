"use client"

import { useState } from "react"
import { estimateTax, type TaxEstimationOutput } from "@/ai/flows/tax-estimation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Calculator, Percent, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TaxEstimatorPage() {
  const [income, setIncome] = useState("")
  const [deductions, setDeductions] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [taxResult, setTaxResult] = useState<TaxEstimationOutput | null>(null)
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!income || !deductions || !location) {
        toast({
            title: "Missing Information",
            description: "Please fill out all fields to estimate your taxes.",
            variant: "destructive",
        });
      return
    }

    setIsLoading(true)
    setTaxResult(null)

    try {
      const result = await estimateTax({
        income: parseFloat(income),
        deductions: parseFloat(deductions),
        location,
      })
      setTaxResult(result)
    } catch (error) {
      console.error("Error estimating tax:", error)
      toast({
        title: "Estimation Failed",
        description: "There was an error estimating your taxes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Tax Estimation Tool</h1>
        <p className="text-muted-foreground">Get an AI-powered estimate of your annual tax burden.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimate Your Taxes</CardTitle>
          <CardDescription>Enter your income, deductions, and location to get a projection. This is not financial advice.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="income">Annual Income</Label>
                    <Input id="income" type="number" placeholder="e.g., 75000" value={income} onChange={(e) => setIncome(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="deductions">Total Deductions</Label>
                    <Input id="deductions" type="number" placeholder="e.g., 13850" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g., Austin, TX" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
              ) : (
                <><Calculator className="mr-2 h-4 w-4" /> Estimate Taxes</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {taxResult && (
        <div className="mt-6">
            <h2 className="text-2xl font-bold font-headline mb-4">Estimation Results</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${taxResult.estimatedTax.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total estimated federal, state, and local tax.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Effective Tax Rate</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{taxResult.taxRate.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground">Your total tax as a percentage of your income.</p>
                    </CardContent>
                </Card>
            </div>
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Breakdown</CardTitle>
                    <CardDescription>A detailed explanation of how the tax was estimated.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{taxResult.breakdown}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  )
}
