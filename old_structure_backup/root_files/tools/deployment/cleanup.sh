#!/bin/bash

# Novora Project Cleanup Script
# Run this from the project root directory

echo "🧹 Starting Novora project cleanup..."

# 1. Remove empty dashboard folders
echo "Removing empty dashboard folders..."
rm -rf "apps/admin-dashboard"
rm -rf "apps/core-dashboard" 
rm -rf "apps/enterprise-dashboard"
rm -rf "apps/pro-dashboard"
rm -rf "apps/home-page"
rm -rf "apps/user-dashboard"

# 2. Remove duplicate/misspelled root folders
echo "Removing duplicate root folders..."
rm -rf "Dashboard Enterprise"
rm -rf "Dashbord Enterprice"

# 3. Remove root src folder (shouldn't exist in monorepo)
echo "Removing root src folder..."
rm -rf "src"

# 4. Remove empty/redundant folders
rm -rf "Testing"  # Empty folder
rm -rf "models"   # Contains Python files in a Node.js project

# Note: Keeping generated/prisma since it contains important Prisma generated files

# 5. Clean up any temporary files
echo "Cleaning temporary files..."
find . -name "*.timestamp-*" -delete
find . -name ".DS_Store" -delete

# 6. Verify structure
echo "📂 Remaining structure:"
echo "Apps:"
ls -la apps/ | grep ^d
echo ""
echo "Packages:"
ls -la packages/ | grep ^d
echo ""
echo "Root directories:"
ls -la | grep ^d | grep -v node_modules | grep -v .git

echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to ensure dependencies are good"
echo "2. Run 'npm run dev' to test if everything works"
echo "3. Commit the cleanup: git add . && git commit -m 'Clean up project structure'"
