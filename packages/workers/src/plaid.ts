/**
 * Firebase Functions (v2) — Plaid Link + Transactions Sync
 * - createLinkToken: client obtains link_token
 * - exchangePublicToken: store encrypted access_token; seed accounts
 * - plaidWebhook: handle Plaid webhooks; trigger /sync
 * - syncItemNow: manual sync endpoint for a given item
 */

import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import crypto from 'node:crypto';
import { KeyManagementServiceClient } from '@google-cloud/kms';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  TransactionsSyncRequest,
} from 'plaid';

// --- Secrets ---
const PLAID_CLIENT_ID = defineSecret('PLAID_CLIENT_ID');
const PLAID_SECRET = defineSecret('PLAID_SECRET');
const PLAID_ENV = defineSecret('PLAID_ENV'); // 'sandbox' | 'development' | 'production'
const KMS_KEY = defineSecret('KMS_KEY'); // projects/.../locations/.../keyRings/.../cryptoKeys/... (symmetric)

// --- Init ---
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const kms = new KeyManagementServiceClient();

function plaidClient(): PlaidApi {
  const cfg = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV.value() as keyof typeof PlaidEnvironments],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID.value(),
        'PLAID-SECRET': PLAID_SECRET.value(),
      },
    },
  });
  return new PlaidApi(cfg);
}

// --- Helpers ---
async function verifyAuth(req: any): Promise<string> {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new Error('Missing Authorization bearer token');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

async function encrypt(value: string): Promise<string> {
  const [resp] = await kms.encrypt({ name: KMS_KEY.value(), plaintext: Buffer.from(value) });
  return resp.ciphertext!.toString('base64');
}

async function decrypt(ciphertextB64: string): Promise<string> {
  const [resp] = await kms.decrypt({ name: KMS_KEY.value(), ciphertext: Buffer.from(ciphertextB64, 'base64') });
  return Buffer.from(resp.plaintext as Buffer).toString('utf8');
}

function txFingerprint(accountId: string, amount: number, merchant: string | undefined, dateISO: string) {
  const base = `${accountId}|${amount.toFixed(2)}|${merchant ?? ''}|${dateISO}`;
  return crypto.createHash('sha1').update(base).digest('hex');
}

// --- HTTP: create link token ---
export const createLinkToken = onRequest({ secrets: [PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV] }, async (req, res) => {
  try {
    const uid = await verifyAuth(req);
    const client = plaidClient();
    const resp = await client.linkTokenCreate({
      user: { client_user_id: uid },
      client_name: 'NurseFinAI',
      products: ['transactions'],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    res.json({ link_token: resp.data.link_token });
  } catch (e: any) {
    logger.error('createLinkToken error', e);
    res.status(400).json({ error: e.message });
  }
});

// --- HTTP: exchange public token ---
export const exchangePublicToken = onRequest({ secrets: [PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, KMS_KEY] }, async (req, res) => {
  try {
    const uid = await verifyAuth(req);
    const publicToken = req.body?.public_token as string;
    if (!publicToken) throw new Error('public_token required');

    const client = plaidClient();
    const exch = await client.itemPublicTokenExchange({ public_token: publicToken });
    const accessToken = exch.data.access_token;
    const itemId = exch.data.item_id;

    const cipher = await encrypt(accessToken);
    const instRef = db.collection('institutions').doc(itemId);
    await instRef.set({
      user_id: uid,
      plaid_access_token: cipher,
      status: 'active',
      webhook_ver: 'v2',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      cursor: null,
    });

    const accs = await client.accountsGet({ access_token: accessToken });
    const batch = db.batch();
    for (const a of accs.data.accounts) {
      const accRef = db.collection('accounts').doc(a.account_id);
      batch.set(
        accRef,
        {
          user_id: uid,
          item_id: itemId,
          name: a.name,
          official_name: a.official_name ?? null,
          mask: a.mask ?? null,
          type: a.type,
          subtype: a.subtype ?? null,
          currency: a.balances.iso_currency_code ?? 'USD',
          current_balance: a.balances.current ?? null,
          available_balance: a.balances.available ?? null,
          last_sync_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    await batch.commit();

    await runSync(uid, itemId, accessToken);

    res.json({ item_id: itemId, accounts: accs.data.accounts.length });
  } catch (e: any) {
    logger.error('exchangePublicToken error', e);
    res.status(400).json({ error: e.message });
  }
});

// --- HTTP: manual sync ---
export const syncItemNow = onRequest({ secrets: [PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, KMS_KEY] }, async (req, res) => {
  try {
    const uid = await verifyAuth(req);
    const itemId = (req.query.item_id as string) || req.body?.item_id;
    if (!itemId) throw new Error('item_id required');

    const inst = await db.collection('institutions').doc(itemId).get();
    if (!inst.exists || inst.get('user_id') !== uid) throw new Error('not found');

    const token = await decrypt(inst.get('plaid_access_token'));
    await runSync(uid, itemId, token);
    res.json({ ok: true });
  } catch (e: any) {
    logger.error('syncItemNow error', e);
    res.status(400).json({ error: e.message });
  }
});

// --- Plaid webhook ---
export const plaidWebhook = onRequest({ secrets: [PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV, KMS_KEY] }, async (req, res) => {
  try {
    const body = req.body || {};
    const itemId = body.item_id as string | undefined;
    const webhookType = body.webhook_type as string;
    const webhookCode = body.webhook_code as string;

    logger.info('Plaid webhook', { webhookType, webhookCode, itemId });

    if (webhookType === 'TRANSACTIONS' && webhookCode === 'SYNC_UPDATES_AVAILABLE' && itemId) {
      const inst = await db.collection('institutions').doc(itemId).get();
      if (!inst.exists) return res.status(200).send('ok');
      const uid = inst.get('user_id');
      const token = await decrypt(inst.get('plaid_access_token'));
      await runSync(uid, itemId, token);
    }

    res.status(200).send('ok');
  } catch (e: any) {
    logger.error('webhook error', e);
    res.status(200).send('ok');
  }
});

// --- Core sync loop ---
async function runSync(uid: string, itemId: string, accessToken: string) {
  const client = plaidClient();
  const instRef = db.collection('institutions').doc(itemId);
  const instSnap = await instRef.get();
  let cursor: string | null = instSnap.get('cursor') ?? null;

  let hasMore = true;
  let addedCount = 0;
  let modifiedCount = 0;
  let removedCount = 0;

  while (hasMore) {
    const req: TransactionsSyncRequest = { access_token: accessToken, cursor: cursor ?? undefined, count: 500 };
    const resp = await client.transactionsSync(req);

    const batch = db.batch();
    for (const tx of [...resp.data.added, ...resp.data.modified]) {
      const merchant = tx.merchant_name || tx.name || '';
      const fp = txFingerprint(tx.account_id, tx.amount, merchant, tx.date);
      const txRef = db.collection('transactions').doc(tx.transaction_id);
      batch.set(
        txRef,
        {
          user_id: uid,
          account_id: tx.account_id,
          item_id: itemId,
          amount: tx.amount,
          iso_currency: tx.iso_currency_code || 'USD',
          iso_date: tx.iso_currency_code ? tx.date : tx.date,
          pending: tx.pending,
          merchant_name: merchant || null,
          mcc: tx.personal_finance_category?.primary || null,
          location: tx.location || null,
          raw_description: tx.name || null,
          category: tx.category || [],
          nurse_category: null,
          rule_id: null,
          notes: null,
          tags: [],
          duplicates: [],
          fingerprint: fp,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          posted_at: new Date(tx.date),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    for (const r of resp.data.removed) {
      const txRef = db.collection('transactions').doc(r.transaction_id);
      batch.set(txRef, { removed: true, updated_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }

    batch.set(instRef, { cursor: resp.data.next_cursor, last_sync_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit();

    addedCount += resp.data.added.length;
    modifiedCount += resp.data.modified.length;
    removedCount += resp.data.removed.length;

    cursor = resp.data.next_cursor;
    hasMore = !!resp.data.has_more;
  }

  logger.info('sync complete', { itemId, addedCount, modifiedCount, removedCount });
}

export const nightlySafetySync = onSchedule('0 5 * * *', async () => {
  const insts = await db.collection('institutions').where('status', '==', 'active').get();
  for (const docSnap of insts.docs) {
    const uid = docSnap.get('user_id');
    const token = await decrypt(docSnap.get('plaid_access_token'));
    await runSync(uid, docSnap.id, token);
  }
});
