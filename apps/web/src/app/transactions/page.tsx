'use client';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseClient';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import TransactionsList from '@/components/TransactionsList';
import { apiSyncItemNow } from '@/lib/functionsClient';

export default function TransactionsPage(){
  const [uid,setUid]=useState<string|null>(null);
  const [items,setItems]=useState<{id:string; status:string}[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [syncing,setSyncing]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [okMsg,setOkMsg]=useState<string|null>(null);

  useEffect(()=> onAuthStateChanged(auth,u=> setUid(u?.uid ?? null)),[]);
  useEffect(()=>{ if(!uid) return; const qy=query(collection(db,'institutions'), where('user_id','==',uid)); const unsub=onSnapshot(qy,snap=>{ const next: any[]=[]; snap.forEach(d=> next.push({ id:d.id, status:(d.data() as any).status||'unknown' })); setItems(next); if(next.length && !selected) setSelected(next[0].id); }); return ()=>unsub(); },[uid,selected]);

  async function handleSync(){ if(!selected) return; setSyncing(true); setError(null); setOkMsg(null); try{ await apiSyncItemNow(selected); setOkMsg('Sync queued / completed. Refresh in a moment.'); } catch(e:any){ setError(e.message);} finally{ setSyncing(false);} }

  if(!uid) return <div className="p-6"><p className="text-sm opacity-70">Please sign in.</p></div>;
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium">Linked institutions</label>
          <select value={selected ?? ''} onChange={e=> setSelected(e.target.value)} className="mt-1 border rounded-lg p-2 min-w-[260px]">
            {items.map(it=> <option key={it.id} value={it.id}>{it.id} ({it.status})</option>)}
          </select>
        </div>
        <button onClick={handleSync} disabled={!selected || syncing} className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-60">{syncing?'Syncing…':'Manual Sync'}</button>
        {okMsg && <p className="text-sm text-green-700">{okMsg}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <TransactionsList max={200} />
    </div>
  );
}
