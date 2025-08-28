
"use client";

import {
  useState,
  useMemo,
  useTransition,
  useDeferredValue,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { mockTransactions } from "@/lib/data";
import type { Transaction } from "@/lib/types";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Button } from "@/components/ui/button";
import { TransactionsFilter } from "@/components/transactions/transactions-filter";
import { parseCsv, downloadCsv } from "@/lib/csv";
import {
  validateTransactions,
  TransactionRowType,
} from "@/lib/transactions";
import { addCategory, getCategories } from "@/lib/categories";
import { Icon } from "@/components/ui/icon";

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
    // Start with categories stored externally (e.g. in localStorage)
    const map = new Map<string, string>();
    for (const cat of getCategories()) {
      const key = cat.toLowerCase();
      if (!map.has(key)) map.set(key, cat);
    }
    // Merge in categories from current transactions
    for (const t of transactions) {
      const key = t.category.toLowerCase();
      if (!map.has(key)) map.set(key, t.category);
    }
    return ["all", ...Array.from(map.values())];
  }, [transactions]);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id" | "date">) => {
      setTransactions((prev) => [
        {
          ...transaction,
          id: crypto.randomUUID(),
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
      addCategory(transaction.category);
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
      parsed.forEach((t) => addCategory(t.category));
      setTransactions((prev) => [...parsed, ...prev]);
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(deferredSearchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || transaction.type === filterType;
      const matchesCategory =
        filterCategory === "all" ||
        transaction.category.toLowerCase() === filterCategory.toLowerCase();
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
                <Icon name="upload" size={16} className="mr-2" />
                Import
            </Button>
            <Button variant="outline" onClick={handleDownload}>
                <Icon name="download" size={16} className="mr-2" />
                Export
            </Button>
            <Button variant="outline" onClick={() => router.push('/transactions/scan')}>
                <Icon name="scanLine" size={16} className="mr-2" />
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
          <Icon
            name="loader2"
            size={16}
            className="mr-2 animate-spin"
          />
          Filtering…
        </p>
      )}

      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
