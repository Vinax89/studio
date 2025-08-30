#!/usr/bin/env node
const agent = process.env.npm_config_user_agent || '';
if (agent.includes('yarn') || agent.includes('pnpm')) {
  console.error('Use npm instead of yarn or pnpm to install dependencies.');
  process.exit(1);
}
