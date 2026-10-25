import { spawn } from 'node:child_process';
import { mkdirSync, openSync, readFileSync } from 'node:fs';

const env = { ...process.env };
// Keep this deployment keyless, including when account-wide secrets exist.
for (const line of readFileSync('.env.example', 'utf8').split('\n')) {
  const match = line.match(/^([A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|CLIENT_ID))=/);
  if (match) env[match[1]] = '';
}
Object.assign(env, {
  HOST: '0.0.0.0', PORT: '4173',
  GEV_ALLOWED_HOSTS: `${env.CODESPACE_NAME}-4173.${env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
  GEV_KEY_SETUP_TRUSTED_PEERS: 'none',
});
try {
  const response = await fetch('http://127.0.0.1:4173', { signal: AbortSignal.timeout(2000) });
  if (response.ok) process.exit(0);
} catch {}
mkdirSync('.gev-logs', { recursive: true });
const log = openSync('.gev-logs/codespaces.log', 'a');
const child = spawn('npm', ['run', 'preview', '--', '--host', '0.0.0.0', '--port', '4173', '--strictPort'], { env, detached: true, stdio: ['ignore', log, log] });
child.unref();
