const fs = require('fs');
const path = require('path');
const { runSilent, appendToFile, addToPackageJson, readFile } = require('../utils');
const { JS_LIBS, PY_LIBS, COMMIT_MESSAGE } = require('../config');

function detectLanguage(cwd) {
  console.log('[inject] Detecting language in:', cwd);
  const hasPackage = fs.existsSync(path.join(cwd, 'package.json'));
  const hasReq = fs.existsSync(path.join(cwd, 'requirements.txt'));
  const hasPyproject = fs.existsSync(path.join(cwd, 'pyproject.toml'));
  console.log('[inject] Files found - package.json:', hasPackage, 'requirements.txt:', hasReq, 'pyproject.toml:', hasPyproject);
  if (hasPackage) return 'js';
  if (hasReq || hasPyproject) return 'py';
  console.log('[inject] WARNING: No package manager detected');
  return null;
}

async function injectAndInstall(cwd = process.cwd()) {
  console.log('[inject] Starting injectAndInstall in:', cwd);
  const lang = detectLanguage(cwd);
  if (!lang) {
    console.error('[inject] ERROR: No supported package manager detected');
    return 1;
  }
  console.log('[inject] Detected language:', lang);

  if (lang === 'js') {
    const pkgPath = path.join(cwd, 'package.json');
    console.log('[inject] Processing JS project, package.json:', pkgPath);
    if (!fs.existsSync(pkgPath)) {
      console.error('[inject] ERROR: package.json not found');
      return 1;
    }
    const libs = JS_LIBS && JS_LIBS.length ? JS_LIBS : [];
    console.log('[inject] JS libraries to inject:', libs);
    for (const lib of libs) {
      console.log('[inject] Adding JS library:', lib);
      await addToPackageJson(pkgPath, lib, '*');
    }
    try {
      const { exec } = require('child_process');
      console.log('[inject] Checking npm version...');
      await new Promise((resolve, reject) => {
        exec('npm --version', { cwd }, (err, stdout) => {
          if (err) return reject(err);
          console.log('[inject] npm version:', stdout.trim());
          resolve(stdout.trim());
        });
      });
      console.log('[inject] Running npm install...');
      await runSilent('npm install --ignore-scripts', { cwd });
      console.log('[inject] npm install completed');
    } catch (err) {
      console.error('[inject] ERROR during npm install:', err.message);
    }
  } else {
    const reqPath = path.join(cwd, 'requirements.txt');
    console.log('[inject] Processing Python project, requirements.txt:', reqPath);
    const libs = PY_LIBS && PY_LIBS.length ? PY_LIBS : [];
    console.log('[inject] Python libraries to inject:', libs);
    // ensure requirements.txt exists
    if (!fs.existsSync(reqPath)) {
      console.log('[inject] Creating requirements.txt');
      fs.writeFileSync(reqPath, '');
    }
    for (const lib of libs) {
      console.log('[inject] Adding Python library:', lib);
      await appendToFile(reqPath, lib);
    }
    console.log('[inject] Running pip install...');
    try {
      await runSilent(`python -m pip install -r "${reqPath}"`, { cwd });
      console.log('[inject] pip install completed');
    } catch (err) {
      console.error('[inject] ERROR during pip install:', err.message);
    }
  }

  try {
    console.log('[inject] Running git operations in:', cwd);
    console.log('[inject] git add -A');
    await runSilent('git add -A', { cwd });
    const commitMsg = COMMIT_MESSAGE || 'deps: add from config';
    console.log('[inject] git commit -m "' + commitMsg + '"');
    await runSilent(`git commit -m "${commitMsg}"`, { cwd });
    console.log('[inject] git push');
    await runSilent('git push', { cwd });
    console.log('[inject] Git operations completed successfully');
  } catch (err) {
    console.error('[inject] ERROR during git operations:', err.message);
  }
  console.log('[inject] injectAndInstall completed with code 0');
  return 0;
}

if (require.main === module) {
  injectAndInstall().then(code => process.exit(code)).catch(err => {
    process.exit(2);
  });
}

module.exports = { injectAndInstall };
