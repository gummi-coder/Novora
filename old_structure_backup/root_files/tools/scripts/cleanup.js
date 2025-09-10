const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define patterns for unused files
const UNUSED_PATTERNS = [
  '*.log',
  '*.tmp',
  '*.temp',
  '*.bak',
  '*.swp',
  '*.swo',
  '.DS_Store',
  'Thumbs.db',
  'node_modules/.cache',
  'coverage',
  '.turbo',
  'dist',
  'build',
  '.next',
  '.vercel',
  '.env.local',
  '.env.*.local'
];

// Define patterns for unused code
const UNUSED_CODE_PATTERNS = [
  'console.log',
  'debugger',
  'TODO:',
  'FIXME:',
  'XXX:',
  'console.error',
  'console.warn',
  'console.info',
  'console.debug'
];

// Define directories to search
const SEARCH_DIRS = [
  'apps',
  'packages',
  'infrastructure',
  'tools'
];

console.log('Starting cleanup process...');

// Remove unused files
console.log('\nRemoving unused files...');
UNUSED_PATTERNS.forEach(pattern => {
  try {
    execSync(`find . -name "${pattern}" -type f -delete`);
    console.log(`Removed files matching pattern: ${pattern}`);
  } catch (error) {
    console.error(`Error removing files matching ${pattern}:`, error.message);
  }
});

// Find and report unused code
console.log('\nSearching for unused code...');
SEARCH_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    UNUSED_CODE_PATTERNS.forEach(pattern => {
      try {
        const result = execSync(`grep -r "${pattern}" ${dir} --include="*.{ts,tsx,js,jsx}"`).toString();
        if (result) {
          console.log(`\nFound ${pattern} in ${dir}:`);
          console.log(result);
        }
      } catch (error) {
        // grep returns non-zero exit code when no matches found
        if (error.status !== 1) {
          console.error(`Error searching for ${pattern} in ${dir}:`, error.message);
        }
      }
    });
  }
});

// Clean up package.json files
console.log('\nCleaning up package.json files...');
const findPackageJson = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findPackageJson(fullPath);
    } else if (file === 'package.json') {
      try {
        const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        let modified = false;

        // Remove unused scripts
        if (packageJson.scripts) {
          const unusedScripts = ['prestart', 'poststart', 'prebuild', 'postbuild'];
          unusedScripts.forEach(script => {
            if (packageJson.scripts[script]) {
              delete packageJson.scripts[script];
              modified = true;
            }
          });
        }

        // Remove unused dependencies
        if (packageJson.dependencies) {
          const unusedDeps = ['@types/node', 'typescript', 'ts-node'];
          unusedDeps.forEach(dep => {
            if (packageJson.dependencies[dep]) {
              delete packageJson.dependencies[dep];
              modified = true;
            }
          });
        }

        if (modified) {
          fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2));
          console.log(`Cleaned up ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  });
};

SEARCH_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    findPackageJson(dir);
  }
});

// Clean up tsconfig.json files
console.log('\nCleaning up tsconfig.json files...');
const findTsConfig = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findTsConfig(fullPath);
    } else if (file === 'tsconfig.json') {
      try {
        const tsConfig = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        let modified = false;

        // Remove unused compiler options
        if (tsConfig.compilerOptions) {
          const unusedOptions = ['noImplicitAny', 'strictNullChecks'];
          unusedOptions.forEach(option => {
            if (tsConfig.compilerOptions[option] === false) {
              delete tsConfig.compilerOptions[option];
              modified = true;
            }
          });
        }

        if (modified) {
          fs.writeFileSync(fullPath, JSON.stringify(tsConfig, null, 2));
          console.log(`Cleaned up ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  });
};

SEARCH_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    findTsConfig(dir);
  }
});

console.log('\nCleanup complete! 🧹'); 