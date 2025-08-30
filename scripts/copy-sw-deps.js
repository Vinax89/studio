#!/usr/bin/env node
const { copyFileSync } = require('fs');
const { join } = require('path');

// Resolve the built module path for idb
const idbPath = require.resolve('idb/build/index.js');
const destPath = join(__dirname, '..', 'public', 'idb.js');

copyFileSync(idbPath, destPath);
