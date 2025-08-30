'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebaseClient';
import { callFunction } from '@/lib/functionsClient';

type Tx = { id: string; name: string; amount: number; posted_at?: any };

export default function TransactionsList() {
  const [txs, setTxs] = useState<Tx[]>([]);

  async function load() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const q = query(
      collection(db, 'transactions'),
      where('user_id', '==', uid),
      orderBy('posted_at', 'desc')
    );
    const snap = await getDocs(q);
    const rows: Tx[] = [];
    snap.forEach(d => rows.push({ id: d.id, ...(d.data() as any) }));
    setTxs(rows);
  }

  useEffect(() => {
    load();
  }, []);

  async function sync() {
    await callFunction('syncTransactions', { method: 'POST' });
    await load();
  }

  return (
    <div>
      <button onClick={sync} className="mb-4 rounded bg-black text-white px-4 py-2">Sync now</button>
      <ul>
        {txs.map(tx => (
          <li key={tx.id} className="flex justify-between border-b py-2">
            <span>{tx.name}</span>
            <span>{tx.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
