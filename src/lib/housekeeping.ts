import { getAuth } from "firebase/auth";
import { Storage } from "@google-cloud/storage";
import { z } from "zod";

/**
 * Lists objects in the configured storage bucket and deletes any that are
 * older than the retention period. The retention period defaults to 30 days
 * if the RETENTION_DAYS environment variable is not set. The value is
 * validated to ensure it is a non‑negative integer.
 */
export async function runHousekeeping(): Promise<void> {
  // Ensure Firebase auth is initialized to prevent cold‑start penalties
  getAuth();

  const envSchema = z.object({
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    RETENTION_DAYS: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 30))
      .refine((v) => Number.isInteger(v) && v >= 0, {
        message: "RETENTION_DAYS must be a non-negative integer",
      }),
  });

  const env = envSchema.parse(process.env);
  const retentionMs = env.RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - retentionMs;

  const storage = new Storage();
  const bucket = storage.bucket(env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const [files] = await bucket.getFiles();

  const deletions: Promise<unknown>[] = [];

  for (const file of files) {
    const [metadata] = await file.getMetadata();
    const updated = metadata.updated || metadata.timeCreated;
    if (updated && new Date(updated).getTime() < cutoff) {
      deletions.push(file.delete());
    }
  }

  await Promise.all(deletions);
  console.log(
    `Housekeeping job executed, deleted ${deletions.length} file(s)`
  );
}
