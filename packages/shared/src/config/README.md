# Configuration Management

This directory contains the configuration management system for both frontend and backend applications. The system provides type-safe access to environment variables with validation using Zod schemas.

## Structure

- `types.ts` - Shared configuration types and Zod schemas
- `backend.ts` - Backend configuration loader
- `frontend.ts` - Frontend configuration loader
- `vite-env.d.ts` - Type declarations for Vite environment variables

## Environment Variables

### Base Configuration (Shared)
```
NODE_ENV=development|staging|production
API_URL=http://localhost:3000
APP_NAME=MyApp
APP_VERSION=1.0.0
DEBUG=true
```

### Backend Configuration
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Authentication
JWT_SECRET=your-32-character-jwt-secret-key-here
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your-32-character-refresh-token-secret-key-here
REFRESH_TOKEN_EXPIRES_IN=7d

# External Services
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=noreply@example.com

# Storage
STORAGE_BUCKET=your-storage-bucket
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=your_storage_access_key
STORAGE_SECRET_KEY=your_storage_secret_key

# Logging
LOG_LEVEL=debug|info|warn|error
SENTRY_DSN=https://your-sentry-dsn
```

### Frontend Configuration (Vite)
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=MyApp
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_FEATURE_X=false
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_DEFAULT_LOCALE=en
VITE_SUPPORTED_LOCALES=en,es,fr
VITE_DEFAULT_THEME=system|light|dark
```

## Usage

### Backend
```typescript
import { backendConfig } from '@your-org/shared/config/backend';

// Access configuration
const apiUrl = backendConfig.API_URL;
const dbConfig = {
  url: backendConfig.DATABASE_URL,
  pool: {
    min: backendConfig.DATABASE_POOL_MIN,
    max: backendConfig.DATABASE_POOL_MAX,
  },
};
```

### Frontend
```typescript
import { frontendConfig } from '@your-org/shared/config/frontend';

// Access configuration
const apiUrl = frontendConfig.API_URL;
const theme = frontendConfig.DEFAULT_THEME;
```

## Environment Files

Create the following environment files in your project root:

1. `.env` - Default values (committed to version control)
2. `.env.development` - Development environment overrides
3. `.env.staging` - Staging environment overrides
4. `.env.production` - Production environment overrides
5. `.env.local` - Local development overrides (not committed)

The configuration system will load these files in order, with later files taking precedence over earlier ones.

## Security

- Never commit sensitive values to version control
- Use `.env.local` for local development secrets
- Use a secure secret management system in production
- Keep the `.env.example` file updated with all required variables
- Use strong, unique values for secrets in production

## Validation

The configuration system validates all environment variables using Zod schemas. If any required variables are missing or invalid, the application will fail to start with a clear error message indicating which variables need to be fixed. 