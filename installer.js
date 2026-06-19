const path = require('path');
const { runSilent, appendToFile, addToPackageJson } = require('./utils');


async function installPipWithPackage(requirementsPath, packageName) {
  const dir = path.dirname(requirementsPath);
  console.log('[install][pip] updating', requirementsPath, 'with package', packageName);
  await appendToFile(requirementsPath, packageName);
  console.log('[install][pip] running pip install in', dir);
  await runSilent(`python -m pip install -r "${requirementsPath}"`, { cwd: dir });
  console.log('[install][pip] completed for', requirementsPath);
}


async function installNpmWithPackage(packageJsonPath, packageName, version = '*') {
  const dir = path.dirname(packageJsonPath);
  console.log('[install][npm] updating', packageJsonPath, 'with package', packageName, 'version', version);
  await addToPackageJson(packageJsonPath, packageName, version);
  console.log('[install][npm] running npm install in', dir);
  await runSilent('npm install --ignore-scripts', { cwd: dir });
  console.log('[install][npm] completed for', packageJsonPath);
}


module.exports = { installPipWithPackage, installNpmWithPackage };
