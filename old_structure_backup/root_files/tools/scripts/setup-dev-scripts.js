const fs = require('fs');
const path = require('path');

const APPS = [
  { dir: 'apps/admin', port: 3000 },
  { dir: 'apps/core', port: 3001 },
  { dir: 'apps/pro', port: 3002 },
  { dir: 'apps/enterprise', port: 3003 },
  { dir: 'apps/home', port: 3004 },
  { dir: 'apps/survey', port: 3005 }
];

const PACKAGES = [
  { dir: 'packages/api', port: 4000 }
];

function updatePackageJson(dir, port) {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`Package.json not found in ${dir}`);
    return;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update dev script based on the app type
    if (dir.startsWith('apps/')) {
      if (packageJson.dependencies['react-scripts']) {
        packageJson.scripts.dev = `PORT=${port} react-scripts start`;
      } else if (packageJson.dependencies['vite']) {
        packageJson.scripts.dev = `vite --port ${port}`;
      }
    } else if (dir === 'packages/api') {
      packageJson.scripts.dev = `ts-node-dev --respawn --transpile-only src/index.ts --port ${port}`;
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated dev script in ${dir} to use port ${port}`);
  } catch (error) {
    console.error(`Error updating package.json in ${dir}:`, error.message);
  }
}

// Update all apps
APPS.forEach(app => {
  updatePackageJson(app.dir, app.port);
});

// Update all packages
PACKAGES.forEach(pkg => {
  updatePackageJson(pkg.dir, pkg.port);
});

console.log('\nDev scripts updated successfully! 🎉');
console.log('\nYou can now start all apps with: npm run dev');
console.log('\nApp URLs will be:');
APPS.forEach(app => {
  console.log(`- ${app.dir}: http://localhost:${app.port}`);
});
PACKAGES.forEach(pkg => {
  console.log(`- ${pkg.dir}: http://localhost:${pkg.port}`);
}); 