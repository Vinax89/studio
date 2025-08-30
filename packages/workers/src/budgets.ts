import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function requireUser(req: any): Promise<string> {
  const hdr = req.headers?.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token) throw new Error('Missing Authorization token');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

export const upsertBudget = onRequest(async (req, res) => {
  try {
    const uid = await requireUser(req);
    const { month, envelopes, locked } = req.body || {};
    if (!month || !/^\d{4}-\d{2}$/.test(month)) throw new Error('month YYYY-MM required');
    if (!Array.isArray(envelopes)) throw new Error('envelopes[] required');

    const id = `${uid}_${month}`;
    await db.collection('budgets').doc(id).set({ user_id: uid, month, envelopes, locked: !!locked }, { merge: true });
    res.json({ ok: true });
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});
