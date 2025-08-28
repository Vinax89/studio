import { mockAccounts, mockTransactions } from "@/lib/data";

export default function AccountsPage() {
  const accounts = mockAccounts.map(account => {
    const balance = mockTransactions
      .filter(t => t.accountId === account.id)
      .reduce(
        (sum, t) => sum + (t.type === "Income" ? t.amount : -t.amount),
        account.startingBalance,
      );
    return { ...account, balance };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
        <p className="text-muted-foreground">Overview of your accounts and balances.</p>
      </div>
      <div className="grid gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{acc.name}</p>
              <p className="text-sm text-muted-foreground">{acc.type}</p>
            </div>
            <div className="text-right font-semibold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency }).format(acc.balance)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
