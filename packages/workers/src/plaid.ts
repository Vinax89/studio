import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

if (!admin.apps.length) {
  admin.initializeApp();
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

const plaid = new PlaidApi(configuration);
const db = admin.firestore();

function handleCors(req: any, res: any): boolean {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }
  return false;
}

function extractToken(req: any): string {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) throw new Error('Unauthorized');
  return hdr.slice(7);
}

async function currentUid(req: any): Promise<string> {
  const token = extractToken(req);
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

export const createLinkToken = onRequest(async (req, res) => {
  if (handleCors(req, res)) return;
  try {
    const uid = await currentUid(req);
    const resp = await plaid.linkTokenCreate({
      user: { client_user_id: uid },
      client_name: 'NurseFinAI',
      products: ['transactions'],
      language: 'en',
      country_codes: ['US'],
    });
    res.json({ link_token: resp.data.link_token });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export const exchangePublicToken = onRequest(async (req, res) => {
  if (handleCors(req, res)) return;
  try {
    const uid = await currentUid(req);
    const { public_token } = req.body || {};
    if (!public_token) throw new Error('missing public_token');
    const exchange = await plaid.itemPublicTokenExchange({ public_token });
    await db.collection('institutions').add({
      user_id: uid,
      access_token: exchange.data.access_token,
      item_id: exchange.data.item_id,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ item_id: exchange.data.item_id });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export const syncTransactions = onRequest(async (req, res) => {
  if (handleCors(req, res)) return;
  try {
    const uid = await currentUid(req);
    const instSnap = await db.collection('institutions').where('user_id', '==', uid).get();
    let count = 0;
    for (const inst of instSnap.docs) {
      const access_token = inst.data().access_token;
      let cursor: string | undefined = undefined;
      while (true) {
        const resp = await plaid.transactionsSync({ access_token, cursor });
        for (const tx of resp.data.added) {
          await db.collection('transactions').doc(tx.transaction_id).set({
            user_id: uid,
            name: tx.name,
            amount: tx.amount,
            posted_at: admin.firestore.Timestamp.fromDate(new Date(tx.date)),
          }, { merge: true });
          count++;
        }
        if (!resp.data.has_more) break;
        cursor = resp.data.next_cursor;
      }
    }
    res.json({ synced: count });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export const plaidWebhook = onRequest(async (req, res) => {
  if (handleCors(req, res)) return;
  res.json({ ok: true });
});
