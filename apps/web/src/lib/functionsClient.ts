import { auth, FUNCTIONS_ORIGIN } from './firebaseClient';

export async function callFunction(name: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${FUNCTIONS_ORIGIN}/${name}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text as any;
  }
}
