const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the new directory structure
const DIRS = [
  'apps/admin',
  'apps/core',
  'apps/pro',
  'apps/enterprise',
  'apps/home',
  'apps/survey',
  'packages/shared',
  'packages/api',
  'packages/auth',
  'packages/email',
  'packages/notifications',
  'packages/analytics',
  'packages/monitoring',
  'packages/feature-flags',
  'infrastructure/kubernetes',
  'infrastructure/docker',
  'infrastructure/terraform',
  'docs/architecture',
  'docs/api',
  'docs/guides',
  'docs/compliance',
  'tools/scripts',
  'tests/unit',
  'tests/integration',
  'tests/e2e',
  'tests/performance'
];

// Create directories
console.log('Creating directory structure...');
DIRS.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Move existing directories
const MOVES = [
  { from: 'Admin Dashboard', to: 'apps/admin' },
  { from: 'Core Dashboard', to: 'apps/core' },
  { from: 'Pro Dashboard', to: 'apps/pro' },
  { from: 'Enterprise Dashboard', to: 'apps/enterprise' },
  { from: 'Home Page', to: 'apps/home' },
  { from: 'Employee Survey System', to: 'apps/survey' },
  { from: 'Backend', to: 'packages/api' },
  { from: 'Authentication System', to: 'packages/auth' },
  { from: 'Email Service', to: 'packages/email' },
  { from: 'Notification System', to: 'packages/notifications' },
  { from: 'Analytics & Reporting', to: 'packages/analytics' },
  { from: 'Monitoring Service', to: 'packages/monitoring' },
  { from: 'Feature Flag System', to: 'packages/feature-flags' }
];

console.log('\nMoving existing directories...');
MOVES.forEach(({ from, to }) => {
  const sourcePath = path.join(process.cwd(), from);
  const targetPath = path.join(process.cwd(), to);
  
  if (fs.existsSync(sourcePath)) {
    try {
      execSync(`mv "${sourcePath}"/* "${targetPath}/"`);
      fs.rmdirSync(sourcePath);
      console.log(`Moved ${from} to ${to}`);
    } catch (error) {
      console.error(`Error moving ${from} to ${to}:`, error.message);
    }
  }
});

// Create root package.json if it doesn't exist
const rootPackageJson = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(rootPackageJson)) {
  const packageJson = {
    name: 'novora-platform',
    version: '1.0.0',
    private: true,
    workspaces: [
      'apps/*',
      'packages/*'
    ],
    scripts: {
      'dev': 'turbo run dev',
      'build': 'turbo run build',
      'test': 'turbo run test',
      'lint': 'turbo run lint',
      'format': 'prettier --write "**/*.{ts,tsx,md}"',
      'clean': 'turbo run clean && rm -rf node_modules'
    },
    devDependencies: {
      'turbo': 'latest',
      'prettier': 'latest'
    }
  };

  fs.writeFileSync(rootPackageJson, JSON.stringify(packageJson, null, 2));
  console.log('\nCreated root package.json');
}

console.log('\nReorganization complete! 🎉'); 