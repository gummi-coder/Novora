const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting project setup...\n');

// Run reorganization script
console.log('📁 Reorganizing project structure...');
try {
  execSync('node tools/scripts/reorganize.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during reorganization:', error.message);
  process.exit(1);
}

// Run cleanup script
console.log('\n🧹 Cleaning up unused code and configurations...');
try {
  execSync('node tools/scripts/cleanup.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during cleanup:', error.message);
  process.exit(1);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

// Run linting
console.log('\n🔍 Running linter...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during linting:', error.message);
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running tests...');
try {
  execSync('npm run test', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during testing:', error.message);
  process.exit(1);
}

console.log('\n✨ Project setup complete! 🎉');
console.log('\nNext steps:');
console.log('1. Review the changes made by the reorganization and cleanup scripts');
console.log('2. Update any import paths that may have been affected');
console.log('3. Commit the changes to version control');
console.log('4. Update documentation if necessary'); 