import { execSync } from 'node:child_process';
// Look for lines that are exactly "..." and list only the file paths.
const out = execSync(
  "git grep -l -E '^\\s*\\.\\.\\.\\s*$' || true",
  { encoding: 'utf8' }
);

if (out.trim()) {
  console.error(
    '\nFound literal "..." placeholders in repo. Fix or remove these files before deploying:\n'
  );
  console.error(out);
  process.exit(1);
}
