import { execSync } from 'node:child_process';
const out = execSync('git grep -n "\\.\\.\\." || true', { encoding: 'utf8' });
if (out.trim()) {
  console.error('\nFound literal "..." placeholders in repo. Fix or remove these files before deploying:\n');
  const files = out
    .split('\n')
    .filter(Boolean)
    .map(line => line.split(':', 2)[0])
    .join('\n');
  console.error(files);
  process.exit(1);
}
