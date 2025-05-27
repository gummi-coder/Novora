const fs = require('fs');
const path = require('path');

const APPS = [
  { dir: 'apps/admin', name: '@novora/admin' },
  { dir: 'apps/core', name: '@novora/core' },
  { dir: 'apps/pro', name: '@novora/pro' },
  { dir: 'apps/enterprise', name: '@novora/enterprise' },
  { dir: 'apps/home', name: '@novora/home' },
  { dir: 'apps/survey', name: '@novora/survey' }
];

const PACKAGES = [
  { dir: 'packages/shared', name: '@novora/shared' },
  { dir: 'packages/auth', name: '@novora/auth' },
  { dir: 'packages/api', name: '@novora/api' }
];

function updatePackageJson(dir, name) {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`Package.json not found in ${dir}`);
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = name;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated package name in ${dir} to ${name}`);
  } catch (error) {
    console.error(`Error updating package.json in ${dir}:`, error.message);
  }
}

// Update all apps
APPS.forEach(app => {
  updatePackageJson(app.dir, app.name);
});

// Update all packages
PACKAGES.forEach(pkg => {
  updatePackageJson(pkg.dir, pkg.name);
});

console.log('\nPackage names updated successfully! 🎉'); 