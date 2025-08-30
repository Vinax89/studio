"use client";

import { useState } from 'react';
import { costOfLiving2024 } from '@/data/costOfLiving2024';
import { calculateCostOfLiving, CostOfLivingBreakdown } from '@/ai/flows/cost-of-living';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CostOfLivingPage() {
  const metros = Object.keys(costOfLiving2024.metros);
  const [metro, setMetro] = useState(metros[0]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [result, setResult] = useState<CostOfLivingBreakdown | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const breakdown = calculateCostOfLiving({
      metro: metro as keyof typeof costOfLiving2024.metros,
      adults,
      children,
    });
    setResult(breakdown);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cost of Living</h1>
        <p className="text-muted-foreground">
          Estimate household expenses by metro area.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Household</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="metro">Metro Area</Label>
              <Select value={metro} onValueChange={setMetro}>
                <SelectTrigger id="metro">
                  <SelectValue placeholder="Select metro" />
                </SelectTrigger>
                <SelectContent>
                  {metros.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </div>
            <Button type="submit" className="sm:col-span-3">
              Calculate
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(result.annual.categories).map(([cat, annual]) => (
              <Card key={cat}>
                <CardHeader>
                  <CardTitle className="capitalize">{cat}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${Math.round(annual / 12).toLocaleString()} / mo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${Math.round(annual).toLocaleString()} / yr
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${Math.round(result.monthly.total).toLocaleString()} / mo
              </p>
              <p className="text-sm text-muted-foreground">
                ${Math.round(result.annual.total).toLocaleString()} / yr
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Source: {costOfLiving2024.source} ({costOfLiving2024.baseYear})
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
