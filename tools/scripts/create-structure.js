const fs = require('fs');
const path = require('path');

// Define the new project structure
const PROJECT_STRUCTURE = {
  'apps': {
    'admin': {}, // Admin dashboard
    'core': {}, // Core dashboard
    'pro': {}, // Pro dashboard
    'enterprise': {}, // Enterprise dashboard
    'home': {}, // Home page
    'survey': {} // Employee survey system
  },
  'packages': {
    'shared': {}, // Shared utilities, types, components
    'api': {}, // API gateway and services
    'auth': {}, // Authentication system
    'email': {}, // Email service
    'notifications': {}, // Notification system
    'analytics': {}, // Analytics & reporting
    'monitoring': {}, // Monitoring service
    'feature-flags': {} // Feature flag system
  },
  'infrastructure': {
    'kubernetes': {}, // K8s manifests
    'docker': {}, // Docker configurations
    'terraform': {} // Terraform configurations
  },
  'docs': {
    'api': {}, // API documentation
    'architecture': {}, // Architecture documentation
    'guides': {}, // Setup and usage guides
    'compliance': {} // Compliance documentation
  },
  'tools': {
    'scripts': {}, // Utility scripts
    'migrations': {}, // Database migrations
    'seed': {} // Seed data
  },
  'tests': {
    'unit': {}, // Unit tests
    'integration': {}, // Integration tests
    'e2e': {}, // End-to-end tests
    'performance': {} // Performance tests
  }
};

// Create directory structure recursively
function createDirectoryStructure(basePath, structure) {
  Object.entries(structure).forEach(([name, content]) => {
    const dirPath = path.join(basePath, name);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }

    // Add .keep file to empty directories
    if (Object.keys(content).length === 0) {
      const keepFilePath = path.join(dirPath, '.keep');
      if (!fs.existsSync(keepFilePath)) {
        fs.writeFileSync(keepFilePath, '');
        console.log(`Added .keep file to: ${dirPath}`);
      }
    }

    // Recursively create subdirectories
    if (Object.keys(content).length > 0) {
      createDirectoryStructure(dirPath, content);
    }
  });
}

// Create README files for each main directory
function createReadmeFiles(basePath, structure) {
  Object.entries(structure).forEach(([name, content]) => {
    const dirPath = path.join(basePath, name);
    const readmePath = path.join(dirPath, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      const readmeContent = `# ${name.charAt(0).toUpperCase() + name.slice(1)}\n\nThis directory contains ${name} related files and configurations.`;
      fs.writeFileSync(readmePath, readmeContent);
      console.log(`Created README.md in: ${dirPath}`);
    }

    if (Object.keys(content).length > 0) {
      createReadmeFiles(dirPath, content);
    }
  });
}

// Main function to create the structure
function createProjectStructure() {
  const rootPath = process.cwd();
  console.log('Creating new project structure...\n');

  // Create directory structure
  createDirectoryStructure(rootPath, PROJECT_STRUCTURE);

  // Create README files
  createReadmeFiles(rootPath, PROJECT_STRUCTURE);

  console.log('\nProject structure created successfully! 🎉');
}

// Run the script
createProjectStructure(); 