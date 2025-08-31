import { archiveOldTransactions, cleanupDebts } from "../services/housekeeping";
import { logger } from "./logger";

// Run periodic maintenance tasks such as archiving transactions and cleaning up
// settled debts. Throws if any task fails so callers can handle the failure.
export async function runHousekeeping(): Promise<void> {
  const retentionDays = Number.parseInt(process.env.RETENTION_DAYS ?? "30", 10);
  const cutoffDate = new Date(
    Date.now() - retentionDays * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    await archiveOldTransactions(cutoffDate);
    await cleanupDebts();
  } catch (err) {
    logger.error("Housekeeping tasks failed", err);
    throw err;
  }
}
