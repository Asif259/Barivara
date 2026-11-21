// Becomes dist/src/main.js. Hostinger runs that file directly and ships no node_modules.
// shortcut: installs on first boot (slow cold start), drop once Hostinger installs deps itself.
const { execSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..', '..'); // dir holding package.json
const run = (c) => execSync(c, { stdio: 'inherit', cwd: root });
try {
  require.resolve('@nestjs/core', { paths: [root] });
  require.resolve('@prisma/client', { paths: [root] });
} catch {
  run('npm install --omit=dev --no-audit --no-fund --workspaces=false');
  run('npx prisma generate --schema=dist/schema.prisma');
}
require('./app.js');
