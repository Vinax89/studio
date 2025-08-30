'use client';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseClient';
import { collection, onSnapshot, orderBy, query, where, limit, Timestamp } from 'firebase/firestore';

function money(n: number){ try{ return n.toLocaleString(undefined,{style:'currency',currency:'USD'});} catch{ return `$${n.toFixed(2)}`; } }

export type TxRow = { id: string; amount: number; merchant_name?: string|null; iso_currency?: string; posted_at?: Timestamp; nurse_category?: string|null; raw_description?: string|null; };

export default function TransactionsList({ max=200 }: { max?: number }){
  const [uid,setUid]=useState<string|null>(null); const [rows,setRows]=useState<TxRow[]>([]); const [loading,setLoading]=useState(true);
  useEffect(()=> onAuthStateChanged(auth,u=> setUid(u?.uid ?? null)),[]);
  useEffect(()=>{ if(!uid) return; const qy = query(collection(db,'transactions'), where('user_id','==',uid), orderBy('posted_at','desc'), limit(max)); const unsub = onSnapshot(qy, snap=>{ const next: TxRow[]=[]; snap.forEach(d=> next.push({ id:d.id, ...(d.data() as any) })); setRows(next); setLoading(false); }); return ()=>unsub(); },[uid,max]);
  if(!uid) return <p className="text-sm opacity-70">Sign in to view transactions.</p>;
  if(loading) return <p className="text-sm opacity-70">Loading transactions…</p>;
  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-2">Date</th><th className="text-left p-2">Merchant</th><th className="text-left p-2">Category</th><th className="text-right p-2">Amount</th></tr></thead>
        <tbody>
          {rows.map(r=> (
            <tr key={r.id} className="border-t">
              <td className="p-2 whitespace-nowrap">{r.posted_at? r.posted_at.toDate().toLocaleDateString(): ''}</td>
              <td className="p-2">{r.merchant_name || r.raw_description || '—'}</td>
              <td className="p-2">{r.nurse_category || 'uncategorized'}</td>
              <td className="p-2 text-right font-medium">{money(r.amount)}</td>
            </tr>
          ))}
          {rows.length===0 && <tr><td colSpan={4} className="p-4 text-center text-sm opacity-70">No transactions yet. Link an account and sync.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
