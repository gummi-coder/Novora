const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the migration map
const MIGRATION_MAP = {
  // Apps
  'apps/admin': {
    'Admin Dashboard/src': 'apps/admin/src'
  },
  'apps/core': {
    'Dashbord Core/src': 'apps/core/src'
  },
  'apps/pro': {
    'Dashbord Pro/src': 'apps/pro/src'
  },
  'apps/enterprise': {
    'Dashbord Enterprice/src': 'apps/enterprise/src'
  },
  'apps/home': {
    'Home page/src': 'apps/home/src',
    'Home page/public': 'apps/home/public'
  },
  'apps/survey': {
    'employee_survey_frontend/src': 'apps/survey/src',
    'employee_survey_frontend/public': 'apps/survey/public'
  },
  // Shared packages
  'packages/shared': {
    'src/services': 'packages/shared/src/services',
    'src/types': 'packages/shared/src/types',
    'src/utils': 'packages/shared/src/utils',
    'src/components': 'packages/shared/src/components',
    'src/hooks': 'packages/shared/src/hooks',
    'src/config': 'packages/shared/src/config'
  },
  // Auth package
  'packages/auth': {
    'src/services': 'packages/auth/src/services',
    'src/types': 'packages/auth/src/types',
    'src/components': 'packages/auth/src/components',
    'src/hooks': 'packages/auth/src/hooks',
    'src/config': 'packages/auth/src/config'
  },
  // API package
  'packages/api': {
    'employee_survey_backend/src': 'packages/api/src',
    'prisma': 'packages/api/prisma'
  }
};

// Create package.json for each package if it doesn't exist
function createPackageJson(packagePath, packageName) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    const packageJson = {
      name: `@novora/${packageName}`,
      version: '1.0.0',
      private: true,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        'build': 'tsc',
        'dev': 'tsc -w',
        'test': 'vitest',
        'lint': 'eslint src --ext .ts,.tsx',
        'clean': 'rm -rf dist'
      },
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        'eslint': '^8.0.0',
        'vitest': '^1.0.0'
      }
    };
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Created package.json for ${packageName}`);
  }
}

// Create tsconfig.json for each package if it doesn't exist
function createTsConfig(packagePath) {
  const tsConfigPath = path.join(packagePath, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        jsx: 'react-jsx',
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        }
      },
      include: ['src'],
      references: []
    };
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    console.log(`Created tsconfig.json in ${packagePath}`);
  }
}

// Move files from source to destination
function moveFiles(sourcePath, destPath) {
  if (!fs.existsSync(sourcePath)) {
    console.log(`Source path does not exist: ${sourcePath}`);
    return;
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
    console.log(`Created directory: ${destPath}`);
  }

  // Move files
  try {
    execSync(`cp -r "${sourcePath}"/* "${destPath}/"`);
    console.log(`Moved files from ${sourcePath} to ${destPath}`);
  } catch (error) {
    console.error(`Error moving files from ${sourcePath} to ${destPath}:`, error.message);
  }
}

// Main migration function
function migrateCode() {
  const rootPath = process.cwd();
  console.log('Starting code migration...\n');

  // Process each package in the migration map
  Object.entries(MIGRATION_MAP).forEach(([packagePath, migrations]) => {
    const fullPackagePath = path.join(rootPath, packagePath);
    
    // Create package directory if it doesn't exist
    if (!fs.existsSync(fullPackagePath)) {
      fs.mkdirSync(fullPackagePath, { recursive: true });
      console.log(`Created package directory: ${packagePath}`);
    }

    // Create package.json and tsconfig.json
    const packageName = packagePath.split('/').pop();
    createPackageJson(fullPackagePath, packageName);
    createTsConfig(fullPackagePath);

    // Process each migration
    Object.entries(migrations).forEach(([source, dest]) => {
      const fullSourcePath = path.join(rootPath, source);
      const fullDestPath = path.join(rootPath, dest);
      moveFiles(fullSourcePath, fullDestPath);
    });
  });

  console.log('\nCode migration complete! 🎉');
}

// Run the migration
migrateCode(); 