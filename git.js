const { runSilent } = require('./utils');
const { COMMIT_MESSAGE } = require('./config');
const path = require('path');
const fs = require('fs').promises;


async function findGitRoot(startDir) {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;
  while (current !== root) {
    try {
      const stats = await fs.stat(path.join(current, '.git'));
      if (stats.isDirectory()) {
        return current;
      }
    } catch (err) {

    }
    current = path.dirname(current);
  }
  return null;
}


async function addCommitPush(repoRoot) {
  try {
    await runSilent('git add .', { cwd: repoRoot });
  } catch (err) {
    throw err;
  }
  
  const msg = COMMIT_MESSAGE;
  try {
    await runSilent(`git commit -m "${msg}"`, { cwd: repoRoot });
  } catch (err) {
    // Check if there are no changes to commit
    if (err.message.includes('nothing to commit') || err.message.includes('no changes added')) {
      return;
    }
    throw err;
  }
  
  try {
    await runSilent('git push', { cwd: repoRoot });
  } catch (err) {
    // Handle case where no remote is configured
    if (err.message.includes('No configured push destination') || err.message.includes('fatal:')) {
      return;
    }
    throw err;
  }
}


module.exports = { addCommitPush, findGitRoot };