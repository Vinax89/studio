import { archiveOldTransactions, cleanupDebts, backupData } from "../src/services/housekeeping";

async function main() {
  const cutoff = process.env.ARCHIVE_CUTOFF_DATE;
  if (cutoff) {
    await archiveOldTransactions(cutoff);
  } else {
    console.warn("ARCHIVE_CUTOFF_DATE not set, skipping transaction archiving");
  }
  await cleanupDebts();
  await backupData();
  console.info("Housekeeping complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
