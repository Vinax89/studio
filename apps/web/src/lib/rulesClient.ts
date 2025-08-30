'use client';
import { db } from '@/app/src/lib/firebaseClient';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { auth } from '@/app/src/lib/firebaseClient';
import { apiApplyRules, apiPreviewRule } from './rulesFunctionsClient';

export async function createRule(input: { match: any; action: any; priority?: number; enabled?: boolean; }) {
  const uid = auth.currentUser?.uid; if (!uid) throw new Error('Not signed in');
  const ref = await addDoc(collection(db, 'rules'), {
    user_id: uid,
    match: input.match,
    action: input.action,
    priority: input.priority ?? 100,
    enabled: input.enabled ?? true,
    created_at: serverTimestamp(),
  });
  return { id: ref.id };
}

export async function updateRule(ruleId: string, patch: any) {
  await updateDoc(doc(db, 'rules', ruleId), patch);
}

export { apiApplyRules, apiPreviewRule };
