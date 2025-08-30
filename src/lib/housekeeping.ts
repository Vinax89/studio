import { getAuth } from "firebase/auth";
import { getCurrentTime } from "./internet-time";
import { logger } from "./logger";
import {
  archiveOldTransactions,
  cleanupDebts,
  backupData,
} from "../services/housekeeping";

export async function runHousekeeping(): Promise<void> {
  // Ensure auth SDK is initialized to avoid cold-start costs
  getAuth();

  const logEnabled =
    process.env.NEXT_PUBLIC_ENABLE_HOUSEKEEPING_LOG === "true";
  const retention = Number.parseInt(process.env.RETENTION_DAYS || "", 10);
  const retentionDays = Number.isNaN(retention) ? 30 : retention;

  let now: Date;
  try {
    now = await getCurrentTime();
  } catch (err) {
    logger.error("Failed to obtain network time", err);
    now = new Date();
  }

  const cutoffDate = new Date(
    now.getTime() - retentionDays * 24 * 60 * 60 * 1000
  ).toISOString();

  if (logEnabled) {
    logger.info(`Housekeeping started with cutoff ${cutoffDate}`);
  }

  try {
    await archiveOldTransactions(cutoffDate);
    if (logEnabled) {
      logger.info(`Archived transactions older than ${cutoffDate}`);
    }
  } catch (err) {
    logger.error("Failed to archive old transactions", err);
  }

  try {
    await cleanupDebts();
    if (logEnabled) {
      logger.info("Cleaned up debts");
    }
  } catch (err) {
    logger.error("Failed to clean up debts", err);
  }

  try {
    await backupData();
    if (logEnabled) {
      logger.info("Backup completed");
    }
  } catch (err) {
    logger.error("Failed to backup data", err);
  }
}
