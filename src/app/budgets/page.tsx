'use client';
import BudgetEditor from '@/components/BudgetEditor';
export default function BudgetsPage(){
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Budgets</h1>
      <BudgetEditor />
    </div>
  );
}
