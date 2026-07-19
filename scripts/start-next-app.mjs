import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = process.argv[2];
if (!app || !['web', 'admin'].includes(app)) {
  console.error('[start] Usage: node scripts/start-next-app.mjs <web|admin>');
  process.exit(1);
}

const port = process.env.PORT || '3000';
const hostname = '0.0.0.0';

const appDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'apps', app);
const standaloneDir = path.join(appDir, '.next', 'standalone', 'apps', app);
const serverFile = path.join(standaloneDir, 'server.js');

console.log('─'.repeat(60));
console.log(`[start:${app}] RAILWAY_SERVICE_NAME=${process.env.RAILWAY_SERVICE_NAME ?? '(local)'}`);
console.log(`[start:${app}] Listening on ${hostname}:${port}`);
console.log(
  `[start:${app}] If you see 502 in the browser, set Railway → Networking → Target port to ${port}`
);
console.log('─'.repeat(60));

if (!fs.existsSync(serverFile)) {
  console.error(`[start:${app}] Missing ${serverFile}. Run npm run build:${app} first.`);
  process.exit(1);
}

const child = spawn('node', ['server.js'], {
  cwd: standaloneDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: port,
    HOSTNAME: hostname,
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
