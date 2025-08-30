import { runHousekeeping } from '../src/lib/housekeeping';

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--cutoff='));
  const cutoffDate = arg ? arg.split('=')[1] : undefined;
  await runHousekeeping({ cutoffDate });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
