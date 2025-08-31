import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// List tracked files with relevant extensions
const files = execSync('git ls-files', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((f) => /\.(?:js|jsx|ts|tsx|mjs|cjs)$/.test(f));

// Match standalone ellipsis placeholders, ignoring identifiers and spread syntax
const ellipsisRegex = /(?:^|[\s"'`])\.\.\.(?:$|[\s"'`])/;

const offenders = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (ellipsisRegex.test(line)) {
      offenders.push({ file, line: idx + 1 });
    }
  });
}

if (offenders.length) {
  console.error('Found standalone ellipsis placeholders:');
  for (const { file, line } of offenders) {
    console.error(' - %s:%d', file, line);
  }
  process.exit(1);
}
