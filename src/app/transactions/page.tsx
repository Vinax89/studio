
"use client";

import { useState, useMemo, useTransition, useDeferredValue, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { TransactionsFilter } from "@/components/transactions/transactions-filter";
import { parseCsv, downloadCsv } from "@/lib/csv";
import { validateTransactions, TransactionRowType } from "@/lib/transactions";
import { importTransactions } from "@/lib/bank";
import { Upload, Download, ScanLine, Loader2, Landmark } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isPending = isTransitionPending || deferredSearchTerm !== searchTerm;
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const allCategories = transactions.map(t => t.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [transactions]);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id" | "date">) => {
      setTransactions(prev => [
        {
          ...transaction,
          id: crypto.randomUUID(),
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    },
    [setTransactions]
  );

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseCsv<TransactionRowType>(file);
      const parsed = validateTransactions(rows);
      setTransactions(prev => [...parsed, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = "";
    }
  };

  const handleDownload = () => {
    downloadCsv(
      transactions.map(({ id, ...rest }) => rest),
      "transactions.csv"
    );
  };

  const handleBankImport = async () => {
    try {
      const imported = await importTransactions();
      setTransactions(prev => [...imported, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(deferredSearchTerm.toLowerCase());
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, deferredSearchTerm, filterType, filterCategory]);

  const handleSearchChange = useCallback(
    (value: string) => {
      startTransition(() => setSearchTerm(value));
    },
    [startTransition, setSearchTerm]
  );

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Track and manage your income and expenses.</p>
        </div>
         <div className="flex gap-2 items-center flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Import
            </Button>
            <Button variant="outline" onClick={handleBankImport}>
                <Landmark className="mr-2 h-4 w-4" />
                Import from Bank
            </Button>
            <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>
             <Button variant="outline" onClick={() => router.push('/transactions/scan')}>
                <ScanLine className="mr-2 h-4 w-4" />
                Scan Receipt
            </Button>
            <AddTransactionDialog onSave={addTransaction} />
        </div>
      </div>

      <TransactionsFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        categories={categories}
      />

      {isPending && (
        <p className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Filtering…
        </p>
      )}

      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
