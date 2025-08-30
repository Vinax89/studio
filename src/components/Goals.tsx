'use client';
import React, { useEffect, useState } from 'react';
import { auth, db, initFirebase } from '@/lib/firebase';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';

initFirebase();

function ymdd(d = new Date()) { return d.toISOString().slice(0,10); }

export default function Goals() {
  type Goal = { id: string; name: string; target_amount: number; target_date: string };
  const [uid, setUid] = useState<string|null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<number>(1000);
  const [date, setDate] = useState<string>(new Date(new Date().getFullYear(), new Date().getMonth()+3, 1).toISOString().slice(0,10));
  const [selected, setSelected] = useState<Goal|null>(null);
  const [contrib, setContrib] = useState<number>(50);
  const [msg, setMsg] = useState('');

  useEffect(()=> auth.onAuthStateChanged(u=> setUid(u?.uid ?? null)), []);
  useEffect(()=>{
    if (!uid) return;
    const q = query(collection(db, 'goals'), where('user_id','==',uid), orderBy('target_date','asc'));
    return onSnapshot(q, snap => setGoals(snap.docs.map(d=> ({ id: d.id, ...(d.data() as Omit<Goal,'id'>) }))));
  }, [uid]);

  async function createGoal() {
    if (!uid) return;
    await addDoc(collection(db, 'goals'), { user_id: uid, name, target_amount: target, target_date: date, funding_strategy: 'monthly', created_at: serverTimestamp() });
    setName(''); setTarget(1000);
  }

  async function addContribution() {
    if (!uid || !selected) return;
    await addDoc(collection(db, 'goal_contributions'), { user_id: uid, goal_id: selected.id, amount: contrib, date: ymdd(), created_at: serverTimestamp() });
    setMsg('Added'); setTimeout(()=> setMsg(''), 1000);
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 border rounded-xl p-4 space-y-3">
        <h3 className="font-medium">Create goal</h3>
        <label className="block text-sm">Name</label>
        <input className="border rounded p-2 w-full" value={name} onChange={e=> setName(e.target.value)} />
        <label className="block text-sm mt-2">Target amount</label>
        <input type="number" className="border rounded p-2 w-full" value={target} onChange={e=> setTarget(Number(e.target.value))} />
        <label className="block text-sm mt-2">Target date</label>
        <input type="date" className="border rounded p-2 w-full" value={date} onChange={e=> setDate(e.target.value)} />
        <button className="rounded bg-black text-white px-4 py-2 mt-3" onClick={createGoal}>Create</button>
      </div>

      <div className="md:col-span-2 border rounded-xl p-4">
        <h3 className="font-medium mb-2">Your goals</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-2">Name</th><th className="text-right p-2">Target</th><th className="text-left p-2">Date</th><th className="text-right p-2">Actions</th></tr></thead>
          <tbody>
            {goals.map(g => (
              <tr key={g.id} className="border-t">
                <td className="p-2">{g.name}</td>
                <td className="p-2 text-right">{g.target_amount?.toLocaleString(undefined,{style:'currency',currency:'USD'})}</td>
                <td className="p-2">{g.target_date}</td>
                <td className="p-2 text-right"><button className="underline" onClick={()=> setSelected(g)}>Contribute</button></td>
              </tr>
            ))}
            {goals.length===0 && <tr><td className="p-2" colSpan={4}>No goals yet.</td></tr>}
          </tbody>
        </table>

        {selected && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium">Contribute to {selected.name}</h4>
            <div className="flex items-end gap-3">
              <input type="number" className="border rounded p-2" value={contrib} onChange={e=> setContrib(Number(e.target.value))} />
              <button className="rounded border px-4 py-2" onClick={addContribution}>Add contribution</button>
              {msg && <span className="text-sm">{msg}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
