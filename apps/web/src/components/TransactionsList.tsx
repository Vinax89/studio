'use client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseClient';
import { syncTransactions } from '@/lib/functionsClient';

type Tx = { id: string; name?: string; amount?: number };

export default function TransactionsList() {
  const [txs, setTxs] = useState<Tx[]>([]);

  async function load() {
    const q = query(collection(db, 'transactions'), orderBy('posted_at', 'desc'));
    const snap = await getDocs(q);
    setTxs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  }

  useEffect(() => {
    load();
  }, []);

  const handleSync = async () => {
    await syncTransactions();
    await load();
  };

  return (
    <div>
      <button onClick={handleSync} className="mb-4 rounded bg-black text-white px-4 py-2">Sync</button>
      <ul>
        {txs.map((t) => (
          <li key={t.id}>{t.name} {t.amount}</li>
        ))}
      </ul>
    </div>
  );
}
