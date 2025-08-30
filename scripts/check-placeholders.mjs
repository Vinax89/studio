import { execSync } from 'node:child_process';
const out = execSync('git grep -n "\\.\\.\\." || true', { encoding: 'utf8' });
if (out.trim()) {
  console.error('\nFound literal "..." placeholders in repo. Fix or remove these files before deploying:\n');
  console.error(out);
  process.exit(1);
}
