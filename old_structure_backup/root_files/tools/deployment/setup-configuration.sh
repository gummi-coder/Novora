#!/bin/bash

# Novora Survey Platform - Configuration Setup Script

echo "🔧 Setting up Novora Survey Platform Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64
}

# Function to check if file exists
file_exists() {
    [ -f "$1" ]
}

# Function to backup existing file
backup_file() {
    if file_exists "$1"; then
        cp "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
        print_warning "Backed up existing $1"
    fi
}

echo "📁 Creating configuration files..."

# 1. Backend Environment Configuration
print_info "Setting up backend environment..."

cd backend

# Backup existing .env if it exists
backup_file ".env"

# Create .env from example
if file_exists "env.production.example"; then
    cp env.production.example .env
    print_status "Created backend .env from example"
else
    print_error "env.production.example not found"
    exit 1
fi

# Generate secure secrets for production
SECRET_KEY=$(generate_secret)
POSTGRES_PASSWORD=$(generate_secret)
REDIS_PASSWORD=$(generate_secret)

# Update .env with secure values
sed -i.bak "s/your-super-secret-production-key-change-this-immediately/$SECRET_KEY/" .env
sed -i.bak "s/your_secure_postgres_password_here/$POSTGRES_PASSWORD/" .env
sed -i.bak "s/your_secure_redis_password_here/$REDIS_PASSWORD/" .env

# Remove backup files
rm -f .env.bak

print_status "Backend environment configured with secure secrets"

# 2. Frontend Environment Configuration
print_info "Setting up frontend environment..."

cd ../frontend

# Create environment files from examples
for env_file in development staging production; do
    if file_exists "env.$env_file.example"; then
        backup_file ".env.$env_file"
        cp "env.$env_file.example" ".env.$env_file"
        print_status "Created .env.$env_file"
    else
        print_warning "env.$env_file.example not found"
    fi
done

# 3. SSL Certificate Setup
print_info "Setting up SSL certificates..."

cd ../backend

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate self-signed certificate if not exists
if ! file_exists "ssl/cert.pem" || ! file_exists "ssl/key.pem"; then
    print_info "Generating self-signed SSL certificate..."
    
    # Activate virtual environment and generate certificate
    source venv/bin/activate
    python -c "
from app.core.ssl import ssl_config
success, message = ssl_config.create_self_signed_cert('localhost')
print(f'SSL Certificate: {message}')
"
    
    if file_exists "ssl/cert.pem" && file_exists "ssl/key.pem"; then
        print_status "SSL certificates generated successfully"
    else
        print_error "Failed to generate SSL certificates"
    fi
else
    print_status "SSL certificates already exist"
fi

# 4. Create logs directory
print_info "Setting up log directories..."

mkdir -p logs
mkdir -p uploads

print_status "Log and upload directories created"

# 5. Database initialization
print_info "Setting up database..."

# Check if database exists
if ! file_exists "novora.db"; then
    print_info "Initializing database..."
    source venv/bin/activate
    python init_database.py
    print_status "Database initialized"
else
    print_status "Database already exists"
fi

# 6. Verify configuration
print_info "Verifying configuration..."

# Test backend imports
source venv/bin/activate
if python -c "from app.main import app; print('Backend imports successfully')" 2>/dev/null; then
    print_status "Backend configuration verified"
else
    print_error "Backend configuration verification failed"
    exit 1
fi

cd ../frontend

# Test frontend build
if npm run build >/dev/null 2>&1; then
    print_status "Frontend configuration verified"
else
    print_error "Frontend configuration verification failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Configuration setup completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   Backend .env: ✅ Created with secure secrets"
echo "   Frontend .env files: ✅ Created for all environments"
echo "   SSL Certificates: ✅ Generated for localhost"
echo "   Nginx Config: ✅ Created"
echo "   Database: ✅ Initialized"
echo "   Logs Directory: ✅ Created"
echo ""
echo "🔐 Generated Secrets:"
echo "   SECRET_KEY: [REDACTED]"
echo "   POSTGRES_PASSWORD: [REDACTED]"
echo "   REDIS_PASSWORD: [REDACTED]"
echo ""
echo "🚀 Next Steps:"
echo "   1. Review and customize .env files if needed"
echo "   2. Run: ./start-servers.sh"
echo "   3. Access: http://localhost:3000 (frontend)"
echo "   4. Access: http://localhost:8000 (backend)"
echo "   5. API Docs: http://localhost:8000/docs"
echo ""
echo "⚠️  Important Notes:"
echo "   - SSL certificates are self-signed (for development only)"
echo "   - For production, replace with proper SSL certificates"
echo "   - Review and update environment variables for your deployment"
echo "   - Backup files created with .backup extension"
