const { exec } = require("child_process");
const util = require("util");
const fs = require("fs").promises;
const path = require("path");

const execPromise = util.promisify(exec);

async function runSilent(command, options = {}) {
  const execOptions = {
    ...options,
    windowsHide: true,
  };
  try {
    const { stdout, stderr } = await execPromise(command, execOptions);
  } catch (err) {
    throw err;
  }
}

function isExcluded(fullPath, name) {
  const { EXCLUDED_NAMES, EXCLUDED_PATTERNS } = require("./config");
  if (EXCLUDED_NAMES.includes(name)) {
    return true;
  }
  const result = EXCLUDED_PATTERNS.some((pattern) =>
    fullPath.includes(pattern),
  );
  return result;
}

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    // Check for BOM and strip if present
    const cleanData = data.charCodeAt(0) === 0xfeff ? data.slice(1) : data;
    return cleanData;
  } catch (err) {
    throw err;
  }
}

async function writeFile(filePath, content) {
  await fs.writeFile(filePath, content, "utf8");
}

async function appendToFile(filePath, line) {
  const current = await readFile(filePath);
  const newContent = current.trimEnd() + "\n" + line + "\n";
  await writeFile(filePath, newContent);
}

async function addToPackageJson(packageJsonPath, packageName, version = "*") {
  const content = await readFile(packageJsonPath);
  const pkg = JSON.parse(content);
  if (!pkg.dependencies) {
    pkg.dependencies = {};
  }
  pkg.dependencies[packageName] = version;
  await writeFile(packageJsonPath, JSON.stringify(pkg, null, 2));
}

module.exports = {
  runSilent,
  isExcluded,
  readFile,
  writeFile,
  appendToFile,
  addToPackageJson,
};
