
"use client"

import { useState } from "react"
import {
  analyzeSpendingHabits,
  type AnalyzeSpendingHabitsOutput,
} from "@/ai/flows/analyze-spending-habits"
import {
  suggestDebtStrategy,
  type SuggestDebtStrategyOutput,
} from "@/ai/flows/suggest-debt-strategy"
import { mockGoals, mockDebts } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Lightbulb, TrendingUp, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { DebtStrategyPlan } from "@/components/debts/debt-strategy-plan"

export default function InsightsPage() {
  const [userDescription, setUserDescription] = useState("I'm a staff nurse looking to save for a down payment on a house and pay off my student loans within 5 years.")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSpendingHabitsOutput | null>(null)
  const [debtStrategy, setDebtStrategy] = useState<SuggestDebtStrategyOutput | null>(null)
  const [step, setStep] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [debtError, setDebtError] = useState<string | null>(null)
  const { toast } = useToast();

  // For this demo, we'll use the mock data. In a real app, this would be fetched.
  const goals = mockGoals;
  const debts = mockDebts;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const runDebtStrategy = async () => {
    setStep(1)
    try {
      const strategyInput = debts.map(d => ({
        ...d,
        recurrence: d.recurrence === 'none' ? 'once' : 'monthly',
      }))
      const result = await suggestDebtStrategy({ debts: strategyInput })
      setDebtStrategy(result)
      setStep(2)
      return true
    } catch (error) {
      console.error("Error suggesting debt strategy:", error)
      const description = error instanceof Error ? error.message : String(error)
      toast({
        title: "Debt Strategy Failed",
        description,
        variant: "destructive",
      })
      setDebtError(description)
      return false
    }
  }

  const runFlows = async () => {
    if (files.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please upload at least one financial document.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setShowProgress(true)
    setStep(0)
    setAnalysisResult(null)
    setDebtStrategy(null)
    setAnalyzeError(null)
    setDebtError(null)

    try {
      const financialDocuments = await Promise.all(files.map(fileToDataURI))
      const result = await analyzeSpendingHabits({
        userDescription,
        financialDocuments,
        goals,
      })
      setAnalysisResult(result)
      setStep(1)
    } catch (error) {
      console.error("Error analyzing spending habits:", error)
      const description = error instanceof Error ? error.message : String(error)
      toast({
        title: "Analysis Failed",
        description,
        variant: "destructive",
      })
      setAnalyzeError(description)
      setIsLoading(false)
      return
    }

    await runDebtStrategy()
    setIsLoading(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    await runFlows()
  }

  const handleRetryAnalysis = async () => {
    await runFlows()
  }

  const handleRetryDebtStrategy = async () => {
    setIsLoading(true)
    setShowProgress(true)
    setDebtError(null)
    await runDebtStrategy()
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Financial Insights</h1>
        <p className="text-muted-foreground">Get personalized advice based on your goals and financial documents.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Insights</CardTitle>
          <CardDescription>Your financial goals (from the Goals page) will be automatically included in the analysis. Just provide any relevant documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="user-description">Your Personal Context (Optional)</Label>
              <Textarea
                id="user-description"
                placeholder="e.g., I'm a staff nurse looking to save for a down payment on a house and pay off my student loans within 5 years."
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="financial-documents">Financial Documents</Label>
              <Input
                id="financial-documents"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">Upload documents like pay stubs or bank statements.</p>
            </div>
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                   Generate Analysis
                </>
              )}
            </Button>
          </form>
          {showProgress && (
            <div className="mt-6 space-y-2">
              <Progress value={(step / 2) * 100} />
              <p className="text-sm text-muted-foreground">
                {step < 2
                  ? `Step ${step + 1} of 2: ${step === 0 ? 'Analyzing spending habits' : 'Generating debt strategy'}`
                  : 'All steps completed'}
              </p>
            </div>
          )}
          {analyzeError && (
            <Button onClick={handleRetryAnalysis} variant="outline" size="sm" className="mt-4">
              Retry Analysis
            </Button>
          )}
          {debtError && (
            <Button onClick={handleRetryDebtStrategy} variant="outline" size="sm" className="mt-4">
              Retry Debt Strategy
            </Button>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="p-3 rounded-full bg-accent text-accent-foreground">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Spending Analysis</CardTitle>
                <CardDescription>A summary of your spending patterns.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed">{analysisResult.spendingAnalysis}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-accent text-accent-foreground">
                    <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Savings Opportunities</CardTitle>
                    <CardDescription>Where you can potentially save money.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed whitespace-pre-wrap">{analysisResult.savingsOpportunities}</p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-accent text-accent-foreground">
                    <Sparkles className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>Actionable advice based on your goals and their importance.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed whitespace-pre-wrap">{analysisResult.recommendations}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {debtStrategy && <DebtStrategyPlan strategy={debtStrategy} />}
    </div>
  )
}
