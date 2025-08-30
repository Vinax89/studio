import { getAuth } from "firebase/auth";
import {
  deleteObject,
  getMetadata,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import { logger } from "./logger";

// Cleans up outdated data from Firebase Storage.
export async function runHousekeeping(): Promise<void> {
  // Ensure auth SDK is initialized to avoid cold-start costs
  getAuth();

  const retentionDays = parseInt(process.env.RETENTION_DAYS || "30", 10);
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const storage = getStorage();
  const rootRef = ref(storage);
  const { items } = await listAll(rootRef);

  let deleted = 0;
  for (const item of items) {
    const metadata = await getMetadata(item);
    const created = new Date(metadata.timeCreated).getTime();
    if (now - created > retentionMs) {
      await deleteObject(item);
      deleted++;
      if (process.env.NEXT_PUBLIC_ENABLE_HOUSEKEEPING_LOG === "true") {
        logger.info(`Deleted expired file: ${item.fullPath}`);
      }
    }
  }

  if (process.env.NEXT_PUBLIC_ENABLE_HOUSEKEEPING_LOG === "true") {
    logger.info(
      `Housekeeping job executed: Firebase auth initialized; ${deleted} file(s) deleted`
    );
  }
}
