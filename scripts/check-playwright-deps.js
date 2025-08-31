#!/usr/bin/env node
const { spawnSync } = require('child_process');

const result = spawnSync('pnpm', ['exec', 'playwright', 'install-deps', '--dry-run'], {
  stdio: 'pipe',
  encoding: 'utf-8',
});

if (result.status !== 0) {
  console.warn('Playwright dependencies appear to be missing. Run `pnpm exec playwright install-deps` before running e2e tests.');
}

process.exit(0);
