import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

function ym(d: Date) {
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${y}-${m}`;
}
function monthRange(month: string) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start, end };
}
async function requireUser(req: any): Promise<string> {
  const hdr = req.headers?.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token) throw new Error('Missing Authorization token');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

export async function recompute(uid: string, month: string) {
  const { start, end } = monthRange(month);
  const q = db.collection('transactions')
    .where('user_id', '==', uid)
    .where('posted_at', '>=', start)
    .where('posted_at', '<', end);
  const snap = await q.get();
  const byCat: Record<string, number> = {};
  let spent = 0; let income = 0; let count = 0;
  snap.forEach((d) => {
    const v = d.data() as any;
    const amt = Math.abs(Number(v.amount) || 0);
    const isIncome = !!v.paystub_id; // MVP heuristic
    if (isIncome) income += amt; else { const c = v.nurse_category || 'uncategorized'; byCat[c] = (byCat[c] || 0) + amt; spent += amt; }
    count++;
  });
  const id = `${uid}_${month}`;
  await db.collection('summaries').doc(id).set({
    user_id: uid, month, totals_by_category: byCat, total_spent: spent, total_income: income, tx_count: count,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return { tx: count, spent, income, categories: Object.keys(byCat).length };
}

export const recomputeMonthSummary = onRequest(async (req, res) => {
  try {
    const uid = await requireUser(req);
    const month = String(req.body?.month || req.query?.month || ym(new Date()));
    const result = await recompute(uid, month);
    res.json({ month, ...result });
  } catch (e: any) { logger.error('recomputeMonthSummary', e); res.status(400).json({ error: e.message }); }
});

export const onTxWriteUpdateSummary = onDocumentWritten('transactions/{txId}', async (event) => {
  try {
    const before = event.data?.before.data() as any | undefined;
    const after = event.data?.after.data() as any | undefined;
    const months = new Set<string>();
    const uid = (after?.user_id) || (before?.user_id);
    if (!uid) return;
    const pick = (v: any | undefined) => {
      if (!v?.posted_at) return null;
      const d = v.posted_at.toDate ? v.posted_at.toDate() : new Date(v.posted_at);
      return ym(d);
    };
    const m1 = pick(before); const m2 = pick(after);
    if (m1) months.add(m1); if (m2) months.add(m2);
    for (const m of months) await recompute(uid, m);
  } catch (e) { logger.error('onTxWriteUpdateSummary', e); }
});
