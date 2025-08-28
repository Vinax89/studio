"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { type SuggestDebtStrategyOutput } from "@/ai/flows";

interface DebtStrategyPlanProps {
  strategy: SuggestDebtStrategyOutput;
}

export function DebtStrategyPlan({ strategy }: DebtStrategyPlanProps) {
  return (
    <Card className="bg-accent/50 border-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-3">
              Your AI Debt Payoff Plan:
              <Badge
                variant="secondary"
                className="text-base capitalize bg-primary text-primary-foreground"
              >
                {strategy.recommendedStrategy}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2">
              {strategy.summary}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="border-border/50">
            <AccordionTrigger className="hover:no-underline">
              Why this strategy?
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm dark:prose-invert">
              <p>{strategy.strategyReasoning}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-border/50">
            <AccordionTrigger className="hover:no-underline">
              Recommended Payoff Order
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-2">
                {strategy.payoffOrder.map((item) => (
                  <li key={item.priority}>
                    <span className="font-semibold">{item.debtName}</span>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
