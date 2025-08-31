import { execSync } from 'node:child_process';
const out = execSync('git grep -n "\\.\\.\\." -- . ":!scripts/check-placeholders.mjs" || true', {
  encoding: 'utf8',
}).trim();
if (out) {
  console.error('\nFound literal "..." placeholders in repo. Fix or remove these files before deploying:\n');
  for (const line of out.split('\n')) {
    const [file, lineNo] = line.split(':', 2);
    console.error(`${file}:${lineNo}`);
  }
  process.exit(1);
}
