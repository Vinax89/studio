import { execSync } from 'node:child_process';
const out = execSync('git grep -n "\\.\\.\\." || true', { encoding: 'utf8' });
if (out.trim()) {
  const files = [...new Set(out.trim().split('\n').map(l => l.split(':')[0]))];
  console.error('\nFound literal "..." placeholders in repo. Fix or remove these files before deploying:\n');
  for (const f of files) console.error(f);
  process.exit(1);
}
