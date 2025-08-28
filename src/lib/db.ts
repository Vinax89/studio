import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import crypto from "crypto";

const db = getFirestore(app);

let cachedKey: Buffer | null = null;

async function getEncryptionKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;
  const secretName = process.env.ENCRYPTION_KEY_SECRET;
  if (!secretName) {
    throw new Error("ENCRYPTION_KEY_SECRET is not set");
  }
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name: secretName });
  const payload = version.payload?.data?.toString();
  if (!payload) {
    throw new Error("Secret payload is empty");
  }
  // Expecting base64-encoded key
  cachedKey = Buffer.from(payload, "base64");
  return cachedKey;
}

export async function encrypt(plainText: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export async function decrypt(encoded: string): Promise<string> {
  const key = await getEncryptionKey();
  const data = Buffer.from(encoded, "base64");
  const iv = data.slice(0, 12);
  const tag = data.slice(12, 28); // 16-byte auth tag
  const text = data.slice(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString("utf8");
}

export async function setEncryptedDoc(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>,
  encryptedFields: string[]
): Promise<void> {
  const encryptedData: Record<string, unknown> = { ...data };
  for (const field of encryptedFields) {
    const value = data[field];
    if (typeof value === "string") {
      encryptedData[field] = await encrypt(value);
    }
  }
  await setDoc(doc(db, collectionPath, docId), encryptedData);
}

export async function getDecryptedDoc(
  collectionPath: string,
  docId: string,
  encryptedFields: string[]
): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, collectionPath, docId));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  for (const field of encryptedFields) {
    const value = data[field];
    if (typeof value === "string") {
      data[field] = await decrypt(value);
    }
  }
  return data;
}

export { db };
