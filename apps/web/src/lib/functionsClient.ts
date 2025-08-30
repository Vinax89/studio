import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebaseClient';

const region = process.env.NEXT_PUBLIC_FUNCTIONS_REGION || 'us-central1';
const origin = process.env.NEXT_PUBLIC_FUNCTIONS_ORIGIN;
export const functions = getFunctions(app, region, origin);

export const createLinkToken = httpsCallable<undefined, { link_token: string }>(functions, 'createLinkToken');
export const exchangePublicToken = httpsCallable<{ public_token: string }, { item_id: string }>(functions, 'exchangePublicToken');
export const syncTransactions = httpsCallable<undefined, { ok: boolean }>(functions, 'syncTransactions');
