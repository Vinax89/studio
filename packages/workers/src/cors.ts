export function setCors(res: any, origin?: string) {
  const o = origin || '*';
  res.setHeader('Access-Control-Allow-Origin', o);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
export function handlePreflight(req: any, res: any): boolean {
  setCors(res, req.headers?.origin);
  if (req.method === 'OPTIONS') { res.status(204).send(''); return true; }
  return false;
}
