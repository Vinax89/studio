"use client";

import { useState } from "react";
import { calculateCostOfLiving, type CostOfLivingOutput } from "@/ai/flows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CostOfLivingPage() {
  const [location, setLocation] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CostOfLivingOutput | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!location || !householdSize) {
      toast({
        title: "Missing Information",
        description: "Please provide a state code and household size.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await calculateCostOfLiving({
        location,
        householdSize: parseInt(householdSize, 10),
      });
      setResult(res);
    } catch (error) {
      console.error("Error calculating cost of living:", error);
      toast({
        title: "Calculation Failed",
        description: "There was an error estimating costs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRow = (label: string, data: { monthly: number; annual: number }) => (
    <div className="flex justify-between text-sm" key={label}>
      <span>{label}</span>
      <span>
        ${data.monthly.toFixed(2)} / ${data.annual.toFixed(2)}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost of Living Calculator</h1>
        <p className="text-muted-foreground">
          Estimate monthly and annual expenses based on your state and household size.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Details</CardTitle>
          <CardDescription>Use a two-letter state abbreviation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="e.g., CA" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Household Size</Label>
                <Input id="size" type="number" min={1} value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
              ) : (
                <><Home className="mr-2 h-4 w-4" /> Calculate</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly / Annual Breakdown</CardTitle>
            <CardDescription>First value is monthly, second is annual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {renderRow("Housing", result.housing)}
            {renderRow("Food", result.food)}
            {renderRow("Transportation", result.transportation)}
            {renderRow("Other", result.other)}
            <div className="border-t pt-2 mt-2 font-medium">
              {renderRow("Total", result.total)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
