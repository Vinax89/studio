"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Rocket, Target } from "lucide-react"
import { SuggestDebtStrategyOutput } from "@/ai/flows/suggest-debt-strategy"

interface AIPayoffPlanProps {
    strategy: SuggestDebtStrategyOutput
}

export function AIPayoffPlan({ strategy }: AIPayoffPlanProps) {
    const { recommendedStrategy, strategyReasoning, payoffOrder, summary } = strategy;

    const StrategyIcon = recommendedStrategy === 'avalanche' ? Rocket : Target;
    const strategyName = recommendedStrategy === 'avalanche' ? 'Avalanche Method' : 'Snowball Method';

    return (
        <Card className="bg-accent/50 border-primary/20">
            <CardHeader>
                <div className="flex items-center gap-4">
                     <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Lightbulb className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Your AI-Powered Debt Payoff Plan</CardTitle>
                        <CardDescription>Here's a personalized strategy to tackle your debts efficiently.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                             <div className="flex items-center gap-2 text-lg font-bold">
                                <StrategyIcon className="h-5 w-5"/>
                                <span>Recommended: {strategyName}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{strategyReasoning}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-4">
                             <div className="flex items-center gap-2 text-lg font-bold">
                                <Target className="h-5 w-5"/>
                                <span>Your Payoff Order</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                           {payoffOrder.map(item => (
                                <div key={item.priority} className="flex items-center gap-3">
                                    <Badge className="text-lg">{item.priority}</Badge>
                                    <p className="font-medium">{item.debtName}</p>
                                </div>
                           ))}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Summary & Motivation</h3>
                    <p className="text-muted-foreground italic">"{summary}"</p>
                </div>
            </CardContent>
        </Card>
    )
}
