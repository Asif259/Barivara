// Post-build: swap dist/src/main.js for the boot shim and ship what it needs.
const fs = require('fs');
const path = require('path');
const api = path.resolve(__dirname, '..');
const dist = path.join(api, 'dist');
fs.renameSync(path.join(dist, 'src/main.js'), path.join(dist, 'src/app.js'));
fs.copyFileSync(path.join(__dirname, 'boot.js'), path.join(dist, 'src/main.js'));
fs.copyFileSync(path.join(api, 'package.json'), path.join(dist, 'package.json'));
fs.copyFileSync(path.join(api, 'prisma/schema.prisma'), path.join(dist, 'schema.prisma'));
