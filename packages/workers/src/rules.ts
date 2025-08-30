/**
 * Rules engine endpoints
 * - previewRuleMatches: dry-run a single rule and return matches with explanations
 * - applyRulesNow: apply rules (single rule or all enabled) to user transactions
 */
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// --- Types (lightweight) ---
interface RuleDoc { user_id: string; enabled?: boolean; priority?: number; match: any; action: any; }
interface Tx { id: string; user_id: string; merchant_name?: string; amount: number; mcc?: string; raw_description?: string; posted_at?: FirebaseFirestore.Timestamp; nurse_category?: string|null; rule_id?: string|null; }

// --- Auth helper ---
async function requireUser(req: any): Promise<string> {
  const hdr = req.headers?.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : '';
  if (!token) throw new Error('Missing Authorization token');
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

// --- Match logic ---
function normalize(s?: string|null) { return (s||'').toLowerCase(); }
function containsAll(hay: string, needles: string[]) { return needles.every(n => hay.includes(n.toLowerCase())); }

function matchRule(tx: Tx, rule: RuleDoc): { matches: boolean; reason: string[] } {
  const reasons: string[] = [];
  const m = rule.match || {};
  let ok = true;

  if (m.merchant) {
    const target = normalize(m.merchant);
    const name = normalize(tx.merchant_name) || normalize(tx.raw_description);
    const hit = !!name && name.includes(target);
    ok = ok && hit; if (hit) reasons.push(`merchant contains "${m.merchant}"`);
  }
  if (m.mcc) {
    const hit = normalize(tx.mcc) === normalize(m.mcc);
    ok = ok && hit; if (hit) reasons.push(`mcc == ${m.mcc}`);
  }
  if (m.contains && Array.isArray(m.contains) && m.contains.length) {
    const name = `${normalize(tx.merchant_name)} ${normalize(tx.raw_description)}`;
    const hit = containsAll(name, m.contains);
    ok = ok && hit; if (hit) reasons.push(`text contains: ${m.contains.join(', ')}`);
  }
  if (m.amount_tolerance != null) {
    const tol = Number(m.amount_tolerance) || 0;
    const target = Number(rule.action?.amount) || null; // optional target
    if (target != null) {
      const diff = Math.abs((tx.amount ?? 0) - target);
      const hit = diff <= tol;
      ok = ok && hit; if (hit) reasons.push(`|amount - ${target}| ≤ ${tol}`);
    }
  }
  return { matches: ok, reason: reasons };
}

// Rank rules by priority (lower first)
function sortRules(rules: RuleDoc[]) {
  return [...rules].sort((a,b) => (a.priority ?? 100) - (b.priority ?? 100));
}

async function loadUserRules(uid: string, onlyEnabled = true): Promise<RuleDoc[]> {
  let q: FirebaseFirestore.Query = db.collection('rules').where('user_id','==',uid);
  if (onlyEnabled) q = q.where('enabled','==',true);
  const snap = await q.get();
  return snap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
}

// Evaluate a single rule against recent transactions
async function findMatches(uid: string, rule: RuleDoc, limitCount = 2000): Promise<{ matches: (Tx & { reason: string[] })[]; }> {
  // scope: last 12 months for MVP
  const since = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 365*24*3600*1000));
  const q = db.collection('transactions').where('user_id','==',uid).where('posted_at','>=',since);
  const snap = await q.get();
  const rows: (Tx & { reason: string[] })[] = [];
  for (const d of snap.docs) {
    const v = d.data() as any; const tx: Tx = { id: d.id, ...v } as any;
    const res = matchRule(tx, rule);
    if (res.matches) { rows.push({ ...tx, reason: res.reason }); }
    if (rows.length >= limitCount) break;
  }
  return { matches: rows };
}

// Apply first-matching rule per tx (deterministic, by priority)
async function applyRules(uid: string, rules: RuleDoc[], dryRun = true, maxWrite = 1000) {
  const since = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 365*24*3600*1000));
  const snap = await db.collection('transactions').where('user_id','==',uid).where('posted_at','>=',since).get();
  const ordered = sortRules(rules);
  const changes: Array<{ id: string; from: string|null; to: string; rule_id: string; reason: string[] }> = [];

  for (const d of snap.docs) {
    const tx = { id: d.id, ...(d.data() as any) } as Tx;
    // already categorized? still allow override by priority rules
    let chosen: { to: string; rule_id: string; reason: string[] } | null = null;
    for (const r of ordered) {
      const res = matchRule(tx, r);
      if (res.matches) { chosen = { to: r.action?.nurse_category, rule_id: (r as any).id || '', reason: res.reason }; break; }
    }
    if (chosen && chosen.to && (tx.nurse_category !== chosen.to || tx.rule_id !== chosen.rule_id)) {
      changes.push({ id: tx.id, from: tx.nurse_category ?? null, to: chosen.to, rule_id: chosen.rule_id, reason: chosen.reason });
      if (!dryRun && changes.length <= maxWrite) {
        await d.ref.set({ nurse_category: chosen.to, rule_id: chosen.rule_id, updated_at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
      if (!dryRun && changes.length === maxWrite) break; // safety cap
    }
  }
  return { totalScanned: snap.size, totalChanged: changes.length, changes: changes.slice(0, 100) };
}

export const previewRuleMatches = onRequest(async (req, res) => {
  try {
    const uid = await requireUser(req);
    const body = req.body || {};
    const ruleId = body.ruleId as string | undefined;
    let rule: RuleDoc | null = null;

    if (ruleId) {
      const doc = await db.collection('rules').doc(ruleId).get();
      if (!doc.exists || doc.get('user_id') !== uid) throw new Error('rule not found');
      rule = { ...(doc.data() as any), id: doc.id };
    } else {
      rule = { user_id: uid, match: body.match || {}, action: body.action || {}, enabled: true, priority: body.priority ?? 100 } as any;
    }

    const { matches } = await findMatches(uid, rule!, 1000);
    // summarize
    const sample = matches.slice(0, 25).map(m => ({ id: m.id, merchant_name: m.merchant_name, amount: m.amount, reason: m.reason }));
    res.json({ count: matches.length, sample });
  } catch (e: any) {
    logger.error('previewRuleMatches error', e);
    res.status(400).json({ error: e.message });
  }
});

export const applyRulesNow = onRequest(async (req, res) => {
  try {
    const uid = await requireUser(req);
    const { ruleId, dryRun = false } = req.body || {};

    let rules: RuleDoc[];
    if (ruleId) {
      const doc = await db.collection('rules').doc(ruleId).get();
      if (!doc.exists || doc.get('user_id') !== uid) throw new Error('rule not found');
      rules = [{ ...(doc.data() as any), id: doc.id }];
    } else {
      rules = await loadUserRules(uid, true);
    }

    const result = await applyRules(uid, rules, !!dryRun, 1000);
    res.json({ dryRun: !!dryRun, ...result });
  } catch (e: any) {
    logger.error('applyRulesNow error', e);
    res.status(400).json({ error: e.message });
  }
});

