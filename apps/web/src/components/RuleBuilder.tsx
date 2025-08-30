'use client';
import React, { useState } from 'react';
import { createRule, updateRule, apiPreviewRule, apiApplyRules } from '@/app/src/lib/rulesClient';

const nurseCats = [
  'scrubs','ceus','licensure','agency_fees','housing_stipend_overage','mileage','lodging','per_diem','union_dues','equipment','parking','meals_on_shift','certifications','travel_misc'
];

export default function RuleBuilder({ existing }: { existing?: any }) {
  const [match, setMatch] = useState<any>(existing?.match || { merchant: '', mcc: '', contains: [] as string[], amount_tolerance: undefined });
  const [action, setAction] = useState<any>(existing?.action || { nurse_category: nurseCats[0], split: [] as any[] });
  const [priority, setPriority] = useState<number>(existing?.priority ?? 100);
  const [enabled, setEnabled] = useState<boolean>(existing?.enabled ?? true);
  const [containsInput, setContainsInput] = useState('');
  const [preview, setPreview] = useState<{count:number; sample:any[]} | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');

  function addContains() {
    const tok = containsInput.trim(); if (!tok) return;
    setMatch({ ...match, contains: [...(match.contains||[]), tok] });
    setContainsInput('');
  }
  function removeContains(i: number) {
    const arr = [...(match.contains||[])]; arr.splice(i,1); setMatch({ ...match, contains: arr });
  }

  async function onPreview() {
    setBusy(true); setMsg('');
    try {
      const res = await apiPreviewRule({ match, action, priority });
      setPreview(res);
      setMsg(`Matches: ${res.count}`);
    } catch (e:any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  async function onSave() {
    setBusy(true); setMsg('');
    try {
      if (existing?.id) await updateRule(existing.id, { match, action, priority, enabled });
      else await createRule({ match, action, priority, enabled });
      setMsg('Saved');
    } catch (e:any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  async function onApply() {
    if (!confirm('Apply rules to past transactions? This will modify categories.')) return;
    setBusy(true); setMsg('');
    try {
      const res = await apiApplyRules({ dryRun: false });
      setMsg(`Applied: changed ${res.totalChanged} of ${res.totalScanned}. Showing first ${res.changes?.length||0}.`);
      setPreview({ count: res.totalChanged, sample: res.changes||[] });
    } catch (e:any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4 border rounded-xl p-4">
      <h3 className="text-lg font-semibold">Rule</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Match</h4>
          <label className="block text-sm mt-2">Merchant contains</label>
          <input className="mt-1 w-full border rounded p-2" value={match.merchant||''} onChange={e=>setMatch({...match, merchant: e.target.value})} placeholder="e.g., starbucks" />

          <label className="block text-sm mt-3">MCC</label>
          <input className="mt-1 w-full border rounded p-2" value={match.mcc||''} onChange={e=>setMatch({...match, mcc: e.target.value})} placeholder="e.g., 5814" />

          <label className="block text-sm mt-3">Text must contain (all)</label>
          <div className="flex gap-2 mt-1">
            <input className="flex-1 border rounded p-2" value={containsInput} onChange={e=>setContainsInput(e.target.value)} placeholder="keyword" />
            <button type="button" className="border rounded px-3" onClick={addContains}>Add</button>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {(match.contains||[]).map((t:string,i:number)=> (
              <span key={i} className="text-xs border rounded px-2 py-1">{t} <button className="ml-1" onClick={()=>removeContains(i)}>×</button></span>
            ))}
          </div>

          <label className="block text-sm mt-3">Amount tolerance (optional)</label>
          <input type="number" step="0.01" className="mt-1 w-full border rounded p-2" value={match.amount_tolerance ?? ''} onChange={e=>setMatch({...match, amount_tolerance: e.target.value ? Number(e.target.value): undefined})} placeholder="e.g., 0.50" />
        </div>

        <div>
          <h4 className="font-medium">Action</h4>
          <label className="block text-sm mt-2">Nurse category</label>
          <select className="mt-1 w-full border rounded p-2" value={action.nurse_category} onChange={e=>setAction({...action, nurse_category: e.target.value})}>
            {nurseCats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="block text-sm mt-3">Priority</label>
          <input type="number" className="mt-1 w-full border rounded p-2" value={priority} onChange={e=>setPriority(Number(e.target.value))} />

          <label className="mt-3 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)} /> Enabled
          </label>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <button className="rounded bg-black text-white px-4 py-2" disabled={busy} onClick={onPreview}>Preview</button>
        <button className="rounded border px-4 py-2" disabled={busy} onClick={onSave}>Save</button>
        <button className="rounded border px-4 py-2" disabled={busy} onClick={onApply}>Apply All Enabled Rules</button>
        {busy && <span className="text-sm opacity-70">Working…</span>}
      </div>

      {msg && <p className="text-sm">{msg}</p>}
      {preview && (
        <div className="border rounded p-3 mt-2">
          <h4 className="font-medium">Preview results</h4>
          <p className="text-sm opacity-70">Matches: {preview.count}. Showing up to {preview.sample.length} examples.</p>
          <table className="w-full text-sm mt-2">
            <thead><tr><th className="text-left">Merchant</th><th className="text-left">Amount</th><th className="text-left">Why</th></tr></thead>
            <tbody>
              {preview.sample.map((s:any)=> (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.merchant_name||'—'}</td>
                  <td className="p-2">${'{'}(s.amount||0).toFixed(2){'}'}</td>
                  <td className="p-2 text-xs">{Array.isArray(s.reason)? s.reason.join('; ') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
