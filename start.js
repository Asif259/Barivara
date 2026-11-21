// Hostinger fallback: its runtime bundle ships without node_modules.
// shortcut: installs on first boot (slow cold start), drop once Hostinger installs deps itself.
const { execSync } = require('child_process');
const run = (c) => execSync(c, { stdio: 'inherit' });
let ready = true;
try { require.resolve('@nestjs/core'); require.resolve('@prisma/client'); } catch { ready = false; }
if (!ready) {
  run('npm install --omit=dev --no-audit --no-fund --workspaces=false');
  run('npx prisma generate --schema=apps/api/prisma/schema.prisma');
}
require('./dist/src/main.js');
