'use client';
import React, { useEffect, useState } from 'react';
import { auth, db, initFirebase } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { saveBudget, Envelope } from '@/lib/budgetsClient';

initFirebase();

const NurseCats = [
  'scrubs','ceus','licensure','agency_fees','housing_stipend_overage','mileage','lodging','per_diem','union_dues','equipment','parking','meals_on_shift','certifications','travel_misc','uncategorized'
];

function nowMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function fmt(n: number) { try { return n.toLocaleString(undefined, { style:'currency', currency:'USD' }); } catch { return `$${n.toFixed(2)}`; } }

export default function BudgetEditor() {
  const [month, setMonth] = useState(nowMonth());
  const [uid, setUid] = useState<string | null>(null);
  const [envelopes, setEnvelopes] = useState<Envelope[]>(NurseCats.map(c=> ({ category: c, planned: 0 })));
  const [locked, setLocked] = useState(false);
  type Summary = { totals_by_category?: Record<string, number>; total_income?: number } | null;
  const [summary, setSummary] = useState<Summary>(null);
  const [msg, setMsg] = useState<string>('');

  useEffect(()=> auth.onAuthStateChanged(u=> setUid(u?.uid ?? null)),[]);

  // Load budget & summary for selected month
  useEffect(()=>{
    if (!uid) return;
    const bid = `${uid}_${month}`;
    const unsubB = onSnapshot(doc(db, 'budgets', bid), snap => {
        if (snap.exists()) {
          const v = snap.data() as { envelopes?: Envelope[]; locked?: boolean };
          setEnvelopes(v.envelopes || []);
          setLocked(!!v.locked);
        } else {
          setEnvelopes(NurseCats.map(c=> ({ category: c, planned: 0 })));
          setLocked(false);
        }
      });
    const unsubS = onSnapshot(doc(db, 'summaries', bid), snap => setSummary(snap.exists()? snap.data(): null));
    return () => { unsubB(); unsubS(); };
  }, [uid, month]);

  function setPlanned(i: number, val: number) {
    setEnvelopes(prev => prev.map((e, idx)=> idx===i ? { ...e, planned: isNaN(val)?0:val } : e));
  }

  async function onSave() {
    try { await saveBudget(month, envelopes, locked); setMsg('Saved'); setTimeout(()=> setMsg(''), 1500); } catch (e){ setMsg((e as Error).message);} }

  const spentByCat: Record<string, number> = summary?.totals_by_category || {};

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium">Month</label>
          <input type="month" value={month} onChange={e=> setMonth(e.target.value)} className="border rounded p-2" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={locked} onChange={e=> setLocked(e.target.checked)} /> Lock budget</label>
        <button className="rounded bg-black text-white px-4 py-2" onClick={onSave}>Save</button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-2">Category</th><th className="text-right p-2">Planned</th><th className="text-right p-2">Spent MTD</th><th className="text-right p-2">Remaining</th></tr></thead>
          <tbody>
            {envelopes.map((e, i) => {
              const spent = spentByCat[e.category] || 0;
              const remaining = Math.max(0, (e.planned || 0) - spent);
              return (
                <tr key={e.category} className="border-t">
                  <td className="p-2">{e.category}</td>
                  <td className="p-2 text-right">
                    <input type="number" step="0.01" disabled={locked} value={e.planned} onChange={e2=> setPlanned(i, Number(e2.target.value))} className="max-w-[120px] border rounded p-1 text-right" />
                  </td>
                  <td className="p-2 text-right">{fmt(spent)}</td>
                  <td className="p-2 text-right">{fmt(remaining)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded p-3"><div className="text-sm opacity-70">Total planned</div><div className="text-2xl font-semibold">{fmt(envelopes.reduce((s,e)=> s + (e.planned||0), 0))}</div></div>
        <div className="border rounded p-3"><div className="text-sm opacity-70">Total spent (MTD)</div><div className="text-2xl font-semibold">{fmt(Object.values(spentByCat).reduce((s,n)=> s + (n as number), 0))}</div></div>
        <div className="border rounded p-3"><div className="text-sm opacity-70">Income (MTD)</div><div className="text-2xl font-semibold">{fmt(summary?.total_income || 0)}</div></div>
      </div>
    </div>
  );
}
