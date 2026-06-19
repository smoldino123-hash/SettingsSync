const fs = require('fs').promises;
const path = require('path');
const { isExcluded } = require('./utils');


async function scanProject(rootDir = process.cwd()) {
  const requirementsPaths = [];
  const packageJsonPaths = [];
  const gitRoots = new Set();

  async function scan(dir, parentHasGit = false) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      return;
    }
    let localHasGit = parentHasGit;
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (isExcluded(fullPath, entry.name)) {
        continue;
      }
      if (entry.isDirectory()) {
        if (entry.name === '.git') {
          localHasGit = true;
          gitRoots.add(dir);
          continue;
        }
        await scan(fullPath, localHasGit);
      } else if (entry.isFile()) {
        if (entry.name === 'package.json') {
          packageJsonPaths.push(fullPath);
        }
        if (entry.name === 'requirements.txt') {
          requirementsPaths.push(fullPath);
        }
      }
    }
  }

  await scan(rootDir);
  const result = {
    gitRoots: Array.from(gitRoots),
    packageJsonPaths,
    requirementsPaths
  };
  return result;
}


module.exports = { scanProject };