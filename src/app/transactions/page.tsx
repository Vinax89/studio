"use client";

import { useState } from "react";
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      { ...transaction, id: (prev.length + 1).toString(), date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Track and manage your income and expenses.</p>
        </div>
         <div className="flex gap-2">
            <Button variant="outline">
                <File className="mr-2 h-4 w-4" />
                Export
            </Button>
            <AddTransactionDialog onSave={addTransaction} />
        </div>
      </div>
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
