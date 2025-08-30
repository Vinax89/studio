import { getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "./logger";

const DAY_MS = 24 * 60 * 60 * 1000;

// Cleans up outdated files from Cloud Storage and removes any associated
// Firestore metadata. Files older than RETENTION_DAYS are deleted.
export async function runHousekeeping(): Promise<void> {
  const retentionDays = Number(process.env.RETENTION_DAYS ?? "30");
  const bucketName = process.env.HOUSEKEEPING_BUCKET;
  if (!bucketName) {
    throw new Error("HOUSEKEEPING_BUCKET is not set");
  }

  if (!getApps().length) {
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }

  const cutoff = Date.now() - retentionDays * DAY_MS;
  const bucket = getStorage().bucket(bucketName);
  const [files] = await bucket.getFiles();
  const db = getFirestore();

  for (const file of files) {
    const created = new Date(file.metadata.timeCreated).getTime();
    if (created < cutoff) {
      try {
        await file.delete();
      } catch (err) {
        logger.error(`Failed to delete file ${file.name}`, err);
      }

      try {
        await db.collection("backups").doc(file.name).delete();
      } catch (err) {
        logger.error(`Failed to delete metadata for ${file.name}`, err);
      }
    }
  }

  if (process.env.NEXT_PUBLIC_ENABLE_HOUSEKEEPING_LOG === "true") {
    logger.info(`Housekeeping job executed on bucket ${bucketName}`);
  }
}

