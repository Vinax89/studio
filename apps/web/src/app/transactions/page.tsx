import TransactionsList from '@/components/TransactionsList';

export default function TransactionsPage() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Transactions</h1>
      <TransactionsList />
    </main>
  );
}
