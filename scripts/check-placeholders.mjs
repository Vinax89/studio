#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const repoRoot = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');

const pattern = '(^|\\s)\\.\\.\\.(\\s|$)|TODO';

const args = [
  'grep',
  '--no-index',
  '-nP',
  pattern,
  '--',
  '.',
  ':!node_modules',
  ':!pnpm-lock.yaml',
  ':!yarn.lock',
  ':!scripts/check-placeholders.mjs'
];

const result = spawnSync('git', args, {cwd: repoRoot, encoding: 'utf8'});

if (result.status === 0 && result.stdout.trim().length > 0) {
  console.error('Placeholder markers found:\n' + result.stdout);
  process.exit(1);
} else if (result.status === 1) {
  // No matches found
  process.exit(0);
} else {
  console.error(result.stderr.toString());
  process.exit(result.status ?? 1);
}
