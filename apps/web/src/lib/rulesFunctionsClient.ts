'use client';
import { auth, FUNCTIONS_ORIGIN } from '@/app/src/lib/firebaseClient';

async function idToken(): Promise<string> { const u = auth.currentUser; if (!u) throw new Error('Not authenticated'); return u.getIdToken(true); }
async function call<T=any>(path: string, body?: any): Promise<T> {
  const url = `${FUNCTIONS_ORIGIN}${path.startsWith('/')?'':'/'}${path}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${await idToken()}` }, body: JSON.stringify(body||{})});
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
export async function apiPreviewRule(payload: { ruleId?: string; match?: any; action?: any; priority?: number; }) { return call('/previewRuleMatches', payload); }
export async function apiApplyRules(payload: { ruleId?: string; dryRun?: boolean; }) { return call('/applyRulesNow', payload); }
