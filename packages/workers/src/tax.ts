/**
 * Nurse Tax Prep (MVP)
 * Summarize nurse-specific expense categories by tax year and export CSV.
 * Disclaimer: This is not tax advice. Categories and deductibility depend on the user's facts.
 */
import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const TAX_CATEGORIES: string[] = [
  'ceus','licensure','meals_on_shift','equipment','parking','certifications','union_dues','travel_misc','lodging','mileage','agency_fees'
];

function yearRangeUTC(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));
  return { start, end };
}

async function requireUser(req: any): Promise<string> {
  const hdr = req.headers?.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token) throw new Error('Missing Authorization token');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

function toUSD(n: number) { return Math.round(n * 100) / 100; }

export const taxYearSummary = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST').status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const uid = await requireUser(req);
    const year = Number(req.body?.year || req.query?.year || new Date().getUTCFullYear());
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('invalid year');

    const { start, end } = yearRangeUTC(year);
    const snap = await db.collection('transactions')
      .where('user_id', '==', uid)
      .where('posted_at', '>=', start)
      .where('posted_at', '<', end)
      .get();

    const byCat: Record<string, number> = {};
    const items: any[] = [];

    snap.forEach(d => {
      const v = d.data() as any;
      if (v.removed) return;
      const cat = v.nurse_category || null;
      if (!cat || !TAX_CATEGORIES.includes(cat)) return;
      // Treat as expense if not linked to paystub (income). Use absolute amount to normalize.
      const amt = Math.abs(Number(v.amount) || 0);
      if (!amt) return;
      byCat[cat] = (byCat[cat] || 0) + amt;
      items.push({
        id: d.id,
        date: v.iso_date || (v.posted_at?.toDate ? v.posted_at.toDate().toISOString().slice(0,10) : ''),
        merchant: v.merchant_name || v.raw_description || '',
        nurse_category: cat,
        amount: toUSD(amt),
        notes: v.notes || null,
        has_receipt: !!v.receipt_id,
        receipt_id: v.receipt_id || null,
      });
    });

    const totals = Object.fromEntries(Object.entries(byCat).map(([k,v]) => [k, toUSD(v)]));
    const grand_total = toUSD(Object.values(byCat).reduce((s, n) => s + n, 0));

    res.json({ year, categories: TAX_CATEGORIES, totals, grand_total, count: items.length, sample: items.slice(0, 50) });
  } catch (e: any) {
    logger.error('taxYearSummary error', e);
    res.status(400).json({ error: e.message });
  }
});

export const taxYearCsv = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.set('Allow', 'POST').status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const uid = await requireUser(req);
    const year = Number(req.body?.year || req.query?.year || new Date().getUTCFullYear());
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error('invalid year');

    const { start, end } = yearRangeUTC(year);
    const snap = await db.collection('transactions')
      .where('user_id', '==', uid)
      .where('posted_at', '>=', start)
      .where('posted_at', '<', end)
      .get();

    type Row = { date: string; merchant: string; category: string; amount: number; notes: string; receipt_id: string; tx_id: string };
    const rows: Row[] = [];

    snap.forEach(d => {
      const v = d.data() as any;
      if (v.removed) return;
      const cat = v.nurse_category || null;
      if (!cat || !TAX_CATEGORIES.includes(cat)) return;
      const amt = Math.abs(Number(v.amount) || 0);
      if (!amt) return;
      const date = v.iso_date || (v.posted_at?.toDate ? v.posted_at.toDate().toISOString().slice(0,10) : '');
      rows.push({
        date,
        merchant: (v.merchant_name || v.raw_description || '').replace(/\s+/g, ' ').trim(),
        category: cat,
        amount: toUSD(amt),
        notes: (v.notes || '').replace(/\r?\n/g, ' '),
        receipt_id: v.receipt_id || '',
        tx_id: d.id,
      });
    });

    // CSV header
    const header = ['date','merchant','nurse_category','amount_usd','notes','receipt_id','transaction_id'];
    const csvLines = [header.join(',')];
    for (const r of rows) {
      const cells = [r.date, r.merchant, r.category, r.amount.toFixed(2), r.notes, r.receipt_id, r.tx_id]
        .map((c) => {
          const s = String(c ?? '');
          return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
        });
      csvLines.push(cells.join(','));
    }
    const csv = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="nurse-tax-${year}.csv"`);
    res.status(200).send(csv);
  } catch (e: any) {
    logger.error('taxYearCsv error', e);
    res.status(400).json({ error: e.message });
  }
});

