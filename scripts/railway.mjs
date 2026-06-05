import { spawnSync } from 'node:child_process';

const action = process.argv[2];
const serviceName = (process.env.RAILWAY_SERVICE_NAME || '').toLowerCase();

function resolveWorkspace() {
  if (serviceName.includes('admin')) return 'admin';
  if (serviceName.includes('web')) return 'web';
  if (serviceName.includes('api')) return 'api';

  console.error(
    `[railway] Unknown RAILWAY_SERVICE_NAME="${process.env.RAILWAY_SERVICE_NAME ?? ''}". ` +
      'Rename the Railway service to api, web, or admin.'
  );
  process.exit(1);
}

function run(npmScript) {
  const env = {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME || '0.0.0.0',
  };

  const result = spawnSync('npm', ['run', npmScript], {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  });

  process.exit(result.status ?? 1);
}

const workspace = resolveWorkspace();

if (action === 'build') {
  run(`build:${workspace}`);
}

if (action === 'start') {
  if (workspace === 'api') {
    console.log('[railway] Running db:setup before API start…');
    const setup = spawnSync('npm', ['run', 'db:setup'], {
      stdio: 'inherit',
      env: { ...process.env, HOSTNAME: process.env.HOSTNAME || '0.0.0.0' },
      shell: process.platform === 'win32',
    });
    if (setup.status !== 0) {
      process.exit(setup.status ?? 1);
    }
  }
  run(`start:${workspace}`);
}

console.error('[railway] Usage: node scripts/railway.mjs <build|start>');
process.exit(1);
