#!/usr/bin/env node
// Build wrapper for Windows + Node.js 24 compatibility.
// Node.js 24 on Windows returns EISDIR (not EINVAL) for readlink() on regular
// files, crashing Next.js's "Collecting page data" phase. We fix this by:
//   1. Patching fs.realpathSync via --require so both main process and all
//      worker_threads pick it up through inherited NODE_OPTIONS.
//   2. Adding --preserve-symlinks to cut the number of readlink calls.
const path = require('path');
const { execSync } = require('child_process');

const patchPath = path.resolve(__dirname, 'patch-readlink.js').replace(/\\/g, '/');
const existing = (process.env.NODE_OPTIONS || '').trim();
process.env.NODE_OPTIONS =
  [existing, '--preserve-symlinks', '--preserve-symlinks-main', `--require ${patchPath}`]
    .filter(Boolean)
    .join(' ');

try {
  execSync('node node_modules/next/dist/bin/next build --turbo', {
    stdio: 'inherit',
    env: process.env,
    cwd: path.resolve(__dirname, '..'),
  });
} catch {
  process.exit(1);
}
