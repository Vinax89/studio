import { getAuth } from "firebase/auth";
import { logger } from "./logger";
import {
  archiveOldTransactions,
  cleanupDebts,
  backupData,
} from "../services/housekeeping";

export interface HousekeepingOptions {
  cutoffDate?: string;
}

export async function runHousekeeping(
  options: HousekeepingOptions = {}
): Promise<void> {
  // Initialize auth SDK to avoid cold-start costs
  getAuth();

  const retentionDays = Number(process.env.RETENTION_DAYS ?? "30");
  const cutoff =
    options.cutoffDate ||
    new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  await archiveOldTransactions(cutoff);
  await cleanupDebts();
  await backupData();

  if (process.env.NEXT_PUBLIC_ENABLE_HOUSEKEEPING_LOG === "true") {
    logger.info("Housekeeping job executed");
  }
}
