import { execSync } from 'node:child_process';
const out = execSync('git grep -n "\\.\\.\\." || true', { encoding: 'utf8' });
const filtered = out.split('\n').filter(l => /\s\.\.\.\s/.test(l));
if (filtered.length) {
  console.error('\nFound literal "..." placeholders in repo. Fix or remove these files before deploying:\n');
  console.error(filtered.join('\n'));
  process.exit(1);
}
