'use client';
import { auth, db, initFirebase } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

initFirebase();

export type Envelope = { category: string; planned: number; carryover?: boolean };

export async function saveBudget(month: string, envelopes: Envelope[], locked: boolean) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const id = `${uid}_${month}`;
  await setDoc(doc(db, 'budgets', id), { user_id: uid, month, envelopes, locked }, { merge: true });
}
