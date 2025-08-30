'use client';
import React, { useEffect, useState } from 'react';
import { db, auth } from '@/app/src/lib/firebaseClient';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import RuleBuilder from '@/app/src/components/RuleBuilder';

export default function RulesPage() {
  const [uid, setUid] = useState<string|null>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [selected, setSelected] = useState<any|null>(null);

  useEffect(()=> auth.onAuthStateChanged(u=> setUid(u?.uid??null)),[]);
  useEffect(()=>{
    if (!uid) return;
    const q = query(collection(db, 'rules'), where('user_id','==',uid), orderBy('priority','asc'));
    return onSnapshot(q, (snap)=> setRules(snap.docs.map(d=> ({ id: d.id, ...d.data() } as any))));
  },[uid]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Rules</h1>
        <button className="rounded bg-black text-white px-4 py-2" onClick={()=> setSelected(null)}>New rule</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left p-2">Priority</th><th className="text-left p-2">Category</th><th className="text-left p-2">Enabled</th></tr></thead>
            <tbody>
              {rules.map(r=> (
                <tr key={r.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={()=> setSelected(r)}>
                  <td className="p-2">{r.priority ?? 100}</td>
                  <td className="p-2">{r.action?.nurse_category}</td>
                  <td className="p-2">{String(r.enabled ?? true)}</td>
                </tr>
              ))}
              {rules.length===0 && <tr><td className="p-2" colSpan={3}>No rules yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="md:col-span-2">
          <RuleBuilder existing={selected||undefined} />
        </div>
      </div>
    </div>
  );
}
