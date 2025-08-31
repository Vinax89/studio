#!/usr/bin/env node
const agent = process.env.npm_config_user_agent || '';
if (!agent.includes('pnpm')) {
  console.error('Use pnpm instead of npm or yarn to install dependencies.');
  process.exit(1);
}
