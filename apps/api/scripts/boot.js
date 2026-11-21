// Becomes dist/src/main.js. Hostinger runs that file directly and publishes no node_modules.
// shortcut: installs on first boot (slow cold start), drop once Hostinger installs deps itself.
const { execSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '..'); // dist/, holds package.json + schema.prisma
const run = (c) => execSync(c, { stdio: 'inherit', cwd: root });
try {
  require.resolve('@nestjs/core', { paths: [root] });
  if (!require('fs').existsSync(path.join(root, 'node_modules/.prisma/client/index.js'))) throw 0;
} catch {
  run('npm install --omit=dev --no-audit --no-fund --no-package-lock');
  run('npx prisma generate --schema=schema.prisma');
}
require('./app.js');
