import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

const db = getFirestore();

async function requireAuth(): Promise<User> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Unauthenticated');
  }
  return user;
}

async function requireClaim(user: User, claim: string): Promise<void> {
  const token = await user.getIdTokenResult();
  if (!token.claims[claim]) {
    throw new Error('Unauthorized');
  }
}

export async function getDocument(path: string, claim = 'read') {
  const user = await requireAuth();
  await requireClaim(user, claim);
  return getDoc(doc(db, path));
}

export async function setDocument(path: string, data: unknown, claim = 'write') {
  const user = await requireAuth();
  await requireClaim(user, claim);
  return setDoc(doc(db, path), data);
}

export async function updateDocument(path: string, data: unknown, claim = 'write') {
  const user = await requireAuth();
  await requireClaim(user, claim);
  return updateDoc(doc(db, path), data as any);
}

export async function deleteDocument(path: string, claim = 'delete') {
  const user = await requireAuth();
  await requireClaim(user, claim);
  return deleteDoc(doc(db, path));
}
