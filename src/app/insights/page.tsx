"use client"

import { useState } from "react"
import { analyzeSpendingHabits, type AnalyzeSpendingHabitsOutput } from "@/ai/flows/analyze-spending-habits"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Lightbulb, TrendingUp, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InsightsPage() {
  const [userDescription, setUserDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSpendingHabitsOutput | null>(null)
  const { toast } = useToast();

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
    if (!userDescription || files.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a description and at least one financial document.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const financialDocuments = await Promise.all(files.map(fileToDataURI));
      const result = await analyzeSpendingHabits({ userDescription, financialDocuments });
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error analyzing spending habits:", error);
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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI-Powered Financial Insights</h1>
        <p className="text-muted-foreground">Upload your financial documents to get personalized advice.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Insights</CardTitle>
          <CardDescription>Describe your financial situation and goals, then upload documents like pay stubs or bank statements.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="user-description">Your Financial Goals</Label>
              <Textarea
                id="user-description"
                placeholder="e.g., I'm a staff nurse looking to save for a down payment on a house and pay off my student loans within 5 years."
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                rows={4}
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
              <p className="text-sm text-muted-foreground">You can upload multiple files.</p>
            </div>
            <Button type="submit" disabled={isLoading}>
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
      
      {analysisResult && (
        <div className="grid gap-6 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Lightbulb className="h-6 w-6 text-accent" />
              <div>
                <CardTitle>Spending Analysis</CardTitle>
                <CardDescription>A summary of your spending patterns.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysisResult.spendingAnalysis}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <TrendingUp className="h-6 w-6 text-accent" />
                <div>
                    <CardTitle>Savings Opportunities</CardTitle>
                    <CardDescription>Where you can potentially save money.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysisResult.savingsOpportunities}</p>
            </CardContent>
          </Card>
          <Card>
             <CardHeader className="flex flex-row items-center gap-4">
                <Sparkles className="h-6 w-6 text-accent" />
                <div>
                    <CardTitle>Personalized Recommendations</CardTitle>
                    <CardDescription>Actionable advice based on your profile.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysisResult.recommendations}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
