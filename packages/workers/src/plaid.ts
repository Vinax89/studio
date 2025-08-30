import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase admin
if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

function plaidClient() {
  const env = (process.env.PLAID_ENV || 'sandbox') as keyof typeof PlaidEnvironments;
  const configuration = new Configuration({
    basePath: PlaidEnvironments[env],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
        'PLAID-SECRET': process.env.PLAID_SECRET || '',
      },
    },
  });
  return new PlaidApi(configuration);
}

export const createLinkToken = onCall(async (req) => {
  const client = plaidClient();
  const response = await client.linkTokenCreate({
    user: { client_user_id: req.auth?.uid || 'anonymous' },
    client_name: 'NurseFinAI',
    products: ['transactions'],
    language: 'en',
    country_codes: ['US'],
  });
  return { link_token: response.data.link_token };
});

export const exchangePublicToken = onCall(async (req) => {
  const publicToken = req.data.public_token as string | undefined;
  if (!req.auth?.uid || !publicToken) {
    throw new HttpsError('invalid-argument', 'Missing public_token');
  }
  const client = plaidClient();
  const exchange = await client.itemPublicTokenExchange({ public_token: publicToken });
  await db
    .collection('users')
    .doc(req.auth.uid)
    .collection('plaid_items')
    .doc(exchange.data.item_id)
    .set({ access_token: exchange.data.access_token, item_id: exchange.data.item_id });
  return { item_id: exchange.data.item_id };
});

export const syncTransactions = onCall(async (req) => {
  if (!req.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  // Placeholder sync implementation
  return { ok: true };
});

export const plaidWebhook = onRequest(async (_req, res) => {
  res.status(200).send('ok');
});
