
"use client"

import { useState, useEffect } from "react"
import { analyzeSpendingHabits, type AnalyzeSpendingHabitsOutput, predictSpending } from "@/ai/flows"
import { mockGoals, mockTransactions } from "@/lib/data"; // Import mock data
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Lightbulb, TrendingUp, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { logger } from "@/lib/logger"

export default function InsightsPage() {
  const [userDescription, setUserDescription] = useState("I'm a staff nurse looking to save for a down payment on a house and pay off my student loans within 5 years.")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSpendingHabitsOutput | null>(null)
  const [forecastData, setForecastData] = useState<{ month: string; amount: number }[]>([])
  const { toast } = useToast();

  // For this demo, we'll use mock data. In a real app, this would be fetched.
  const goals = mockGoals;

  useEffect(() => {
    const loadForecast = async () => {
      try {
        const result = await predictSpending({ transactions: mockTransactions });
        setForecastData(result.forecast);
      } catch (error) {
        logger.error("Error predicting spending:", error);
      }
    };
    loadForecast();
  }, []);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (files.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please upload at least one financial document.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const financialDocuments = await Promise.all(files.map(fileToDataURI));
      const result = await analyzeSpendingHabits({ 
          userDescription, 
          financialDocuments,
          goals 
      });
      setAnalysisResult(result);
    } catch (error) {
      logger.error("Error analyzing spending habits:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error generating your financial insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  };

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
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
              />
              {files.length > 0 && (
                <ul className="list-disc pl-5 text-sm">
                  {files.map((file) => (
                    <li key={file.name}>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              )}
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
        </CardContent>
      </Card>

      {forecastData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending Forecast</CardTitle>
            <CardDescription>Projected spending for the next 3 months.</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="var(--color-expenses)" name="Spending" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
