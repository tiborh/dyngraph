#!/usr/bin/env node
// Simple wrapper to run a well-tested static server (http-server) via npx
// Usage: node tools/run-local-server.js [port]

const { spawn } = require('child_process');
const port = process.argv[2] || process.env.PORT || '8000';

const args = ['http-server', '.', '-p', String(port), '-a', '0.0.0.0', '--silent'];
console.log(`Starting http-server via npx on 0.0.0.0:${port}`);

const proc = spawn('npx', args, { stdio: 'inherit' });

proc.on('close', (code) => {
  if (code !== 0) {
    console.error(`http-server exited with code ${code}`);
  }
  process.exit(code);
});

proc.on('error', (err) => {
  console.error('Failed to start http-server via npx:', err && err.message ? err.message : err);
  console.error('If you prefer, install http-server locally: npm install --save-dev http-server');
  console.error('Or run: npx http-server . -p', port);
  process.exit(1);
});
