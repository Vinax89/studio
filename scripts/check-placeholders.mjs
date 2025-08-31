import { execSync } from 'node:child_process';
const out = execSync('git grep -n "\\.\\.\\." || true', { encoding: 'utf8' });
if (out.trim()) {
  console.error('\nFound literal "..." placeholders in repo.');
  console.error('Run `git grep -n "..."` locally to list affected files.');
  process.exit(1);
}
