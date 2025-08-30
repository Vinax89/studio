'use client';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/src/lib/firebaseClient';
import { apiTaxSummary, downloadTaxCsv } from '@/app/src/lib/taxClient';

function currentYear() { return new Date().getFullYear(); }
function fmt(n: number) { try { return n.toLocaleString(undefined, { style:'currency', currency:'USD' }); } catch { return `$${n.toFixed(2)}`; } }

export default function TaxPrepPage() {
  const [uid, setUid] = useState<string|null>(null);
  const [year, setYear] = useState<number>(currentYear());
  const [summary, setSummary] = useState<any|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  useEffect(()=> onAuthStateChanged(auth, u=> setUid(u?.uid ?? null)), []);
  useEffect(()=> { if (uid) load(); }, [uid, year]);

  async function load() {
    setLoading(true); setError(undefined);
    try { setSummary(await apiTaxSummary(year)); } catch (e:any) { setError(e.message); } finally { setLoading(false); }
  }

  if (!uid) return <div className="p-6"><p className="text-sm opacity-70">Please sign in.</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium">Tax year</label>
          <select className="border rounded p-2" value={year} onChange={e=> setYear(Number(e.target.value))}>
            {Array.from({ length: 6 }).map((_,i)=> { const y = currentYear()-i; return <option key={y} value={y}>{y}</option>; })}
          </select>
        </div>
        <button className="rounded bg-black text-white px-4 py-2" disabled={loading} onClick={load}>{loading? 'Refreshing…':'Refresh'}</button>
        <button className="rounded border px-4 py-2" disabled={!summary || loading} onClick={()=> downloadTaxCsv(year)}>Download CSV</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-2">Category</th><th className="text-right p-2">Total</th></tr></thead>
          <tbody>
            {summary?.categories?.map((c:string)=> (
              <tr key={c} className="border-t">
                <td className="p-2">{c}</td>
                <td className="p-2 text-right">{fmt(summary?.totals?.[c] || 0)}</td>
              </tr>
            ))}
            <tr className="border-t font-semibold"><td className="p-2">Grand total</td><td className="p-2 text-right">{fmt(summary?.grand_total || 0)}</td></tr>
          </tbody>
        </table>
      </div>

      {summary?.sample?.length ? (
        <div className="border rounded-xl p-4">
          <h3 className="font-medium mb-2">Sample itemization (first {summary.sample.length} of {summary.count})</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-2">Date</th><th className="text-left p-2">Merchant</th><th className="text-left p-2">Category</th><th className="text-right p-2">Amount</th><th className="text-left p-2">Receipt</th></tr></thead>
              <tbody>
                {summary.sample.map((r:any)=> (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 whitespace-nowrap">{r.date}</td>
                    <td className="p-2">{r.merchant}</td>
                    <td className="p-2">{r.nurse_category}</td>
                    <td className="p-2 text-right">{fmt(r.amount)}</td>
                    <td className="p-2">{r.has_receipt ? 'yes' : 'no'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p className="text-xs text-gray-500">Disclaimer: This report is informational and not tax advice. Deductibility varies by employment status and jurisdiction. Consult a qualified tax professional.</p>
    </div>
  );
}
