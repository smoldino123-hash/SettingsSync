#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const scriptDir = __dirname;
const repoRoot = path.resolve(scriptDir, '..');
const outFile = path.resolve(process.argv[2] || path.join(scriptDir, 'ALL_FILES_NOTE.md'));
const rootDir = path.resolve(process.argv[3] || repoRoot);
const excludeNames = new Set(['node_modules', '.git', 'dist', 'build', '.venv', 'env']);

function isExcluded(p) {
  const parts = p.split(path.sep);
  return parts.some(part => excludeNames.has(part));
}

async function walk(dir, list = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return list;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (isExcluded(full)) continue;
    if (e.isDirectory()) {
      await walk(full, list);
    } else if (e.isFile()) {
      list.push(full);
    }
  }
  return list;
}

function fenceLanguage(filename) {
  const ext = path.extname(filename).toLowerCase().slice(1);
  if (!ext) return 'text';
  return ext.replace(/[^a-z0-9]+/g, '') || 'text';
}

async function run() {
  console.log('[map] Root:', rootDir);
  console.log('[map] Writing to:', outFile);
  const files = await walk(rootDir);
  files.sort();

  let out = `# Files snapshot for ${path.basename(rootDir)}\n\n`;
  for (const f of files) {
    const rel = path.relative(rootDir, f).replace(/\\/g, '/');
    out += `## ${rel}\n\n`;
    const lang = fenceLanguage(f);
    out += '```' + lang + '\n';
    try {
      const content = await fs.readFile(f, 'utf8');
      out += content.replace(/\r\n/g, '\n');
    } catch (err) {
      out += `[could not read file: ${err.message}]`;
    }
    out += '\n```\n\n';
  }

  await fs.writeFile(outFile, out, 'utf8');
  console.log('[map] Completed. Files written:', files.length);
}

run().catch(err => {
  console.error('[map] ERROR:', err);
  process.exit(1);
});
