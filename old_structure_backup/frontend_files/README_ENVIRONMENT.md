# Environment Configuration Guide

This guide covers setting up and managing environment configurations for the Novora Survey Platform frontend.

## Overview

The frontend supports three environments:
- **Development** - Local development with hot reloading and debugging
- **Staging** - Pre-production testing environment
- **Production** - Live production environment

## Environment Files

### Development Environment
```bash
# Copy the example file
cp env.development.example .env.development

# Edit with your local settings
nano .env.development
```

**Key Settings:**
```env
VITE_APP_ENVIRONMENT=development
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_DEBUG=true
VITE_LOG_LEVEL=debug
VITE_DEV_PROXY=true
```

### Staging Environment
```bash
# Copy the example file
cp env.staging.example .env.staging

# Edit with your staging settings
nano .env.staging
```

**Key Settings:**
```env
VITE_APP_ENVIRONMENT=staging
VITE_API_BASE_URL=https://staging-api.novora.com
VITE_APP_DEBUG=false
VITE_LOG_LEVEL=info
VITE_DEV_PROXY=false
```

### Production Environment
```bash
# Copy the example file
cp env.production.example .env.production

# Edit with your production settings
nano .env.production
```

**Key Settings:**
```env
VITE_APP_ENVIRONMENT=production
VITE_API_BASE_URL=https://api.novora.com
VITE_APP_DEBUG=false
VITE_LOG_LEVEL=warn
VITE_DEV_PROXY=false
```

## Environment Variables

### Application Configuration
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_APP_ENVIRONMENT` | Current environment | `development` | `production` |
| `VITE_APP_DEBUG` | Enable debug mode | `true` | `false` |
| `VITE_LOG_LEVEL` | Logging level | `debug` | `warn` |

### API Configuration
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` | `https://api.novora.com` |
| `VITE_API_VERSION` | API version | `v1` | `v2` |

### Feature Flags
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_FEATURE_AUTO_PILOT` | Enable Auto-Pilot feature | `true` | `false` |
| `VITE_FEATURE_SSO` | Enable SSO authentication | `false` | `true` |
| `VITE_FEATURE_API_KEYS` | Enable API key management | `false` | `true` |

### Development Settings
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_DEV_PROXY` | Enable development proxy | `true` | `false` |
| `VITE_DEV_HOT_RELOAD` | Enable hot reloading | `true` | `false` |
| `VITE_DEV_SOURCE_MAPS` | Enable source maps | `true` | `false` |

## Running Different Environments

### Development
```bash
# Using development environment
npm run dev

# Or explicitly
npm run dev:development
```

### Staging
```bash
# Build for staging
npm run build:staging

# Preview staging build
npm run preview:staging
```

### Production
```bash
# Build for production
npm run build:production

# Preview production build
npm run preview:production
```

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:development": "vite --mode development",
    "dev:staging": "vite --mode staging",
    "dev:production": "vite --mode production",
    
    "build": "tsc && vite build",
    "build:development": "tsc && vite build --mode development",
    "build:staging": "tsc && vite build --mode staging",
    "build:production": "tsc && vite build --mode production",
    
    "preview": "vite preview",
    "preview:development": "vite preview --mode development",
    "preview:staging": "vite preview --mode staging",
    "preview:production": "vite preview --mode production"
  }
}
```

## Environment Configuration in Code

### Using the Environment Hook
```tsx
import { useEnvironment, useFeature, useApi } from '@/hooks/useEnvironment';

const MyComponent = () => {
  const { environment, isProduction, config } = useEnvironment();
  const { isEnabled: autoPilotEnabled } = useFeature('autoPilot');
  const { baseUrl, getUrl } = useApi();

  return (
    <div>
      <p>Environment: {environment}</p>
      <p>API Base: {baseUrl}</p>
      {autoPilotEnabled && <AutoPilotFeature />}
    </div>
  );
};
```

### Using Feature Flags
```tsx
import { FeatureFlag } from '@/components/FeatureFlag';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <FeatureFlag feature="autoPilot">
        <AutoPilotSection />
      </FeatureFlag>
      
      <FeatureFlag feature="advancedAnalytics" fallback={<BasicAnalytics />}>
        <AdvancedAnalytics />
      </FeatureFlag>
    </div>
  );
};
```

### Direct Configuration Access
```tsx
import { config, apiConfig, featureFlags } from '@/config/environment';

const App = () => {
  console.log('App Version:', config.app.version);
  console.log('API URL:', apiConfig.fullUrl);
  console.log('Auto-Pilot Enabled:', featureFlags.autoPilot);
  
  return <div>App</div>;
};
```

## Vite Configuration

The Vite configuration automatically handles different environments:

```typescript
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Environment-specific configuration
  const isDevelopment = mode === 'development';
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8000';
  const enableProxy = env.VITE_DEV_PROXY === 'true' && isDevelopment;
  
  return {
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_ENVIRONMENT__: JSON.stringify(mode),
    },
    
    // Proxy configuration for development
    proxy: enableProxy ? {
      '/api': { target: apiBaseUrl, changeOrigin: true },
      '/auth': { target: apiBaseUrl, changeOrigin: true },
    } : {},
    
    // Build configuration
    build: {
      sourcemap: !isDevelopment,
      minify: !isDevelopment,
    },
  };
});
```

## API Configuration

### Development Proxy
In development mode, the Vite dev server proxies API requests:

```typescript
// This request to /api/surveys
fetch('/api/surveys')

// Gets proxied to http://localhost:8000/api/surveys
```

### Production Direct Calls
In production, API calls go directly to the configured backend:

```typescript
// This request to /api/surveys
fetch('/api/surveys')

// Goes directly to https://api.novora.com/api/v1/surveys
```

### Environment-Specific API URLs
```typescript
import { apiConfig } from '@/config/environment';

// Development: http://localhost:8000/api/v1
// Staging: https://staging-api.novora.com/api/v1
// Production: https://api.novora.com/api/v1

const apiUrl = apiConfig.fullUrl; // Full API URL
const baseUrl = apiConfig.baseUrl; // Base URL without /api/v1
```

## Feature Flags

### Managing Features
Feature flags allow you to enable/disable features per environment:

```typescript
// Development: All features enabled for testing
// Staging: Most features enabled, some disabled
// Production: Features enabled based on subscription/plan

const features = {
  autoPilot: true,           // Always enabled
  advancedAnalytics: true,    // Always enabled
  sso: false,                // Disabled in dev, enabled in staging/prod
  apiKeys: false,            // Disabled in dev, enabled in staging/prod
  webhooks: false,           // Disabled in dev, enabled in staging/prod
  realTimeUpdates: false,    // Disabled in dev, enabled in staging/prod
};
```

### Using Feature Flags
```tsx
// Conditional rendering
{featureFlags.autoPilot && <AutoPilotDashboard />}

// Conditional API calls
if (featureFlags.advancedAnalytics) {
  fetchAdvancedAnalytics();
}

// Conditional imports
const AdvancedComponent = featureFlags.advancedAnalytics 
  ? lazy(() => import('./AdvancedComponent'))
  : null;
```

## Security Configuration

### HTTPS Settings
```typescript
const security = {
  enableHttps: false,        // Development: false
  enableHttps: true,         // Staging: true
  enableHttps: true,         // Production: true
};
```

### CORS Settings
```typescript
const security = {
  enableCors: true,          // Development: true (allow all)
  enableCors: true,          // Staging: true (restricted)
  enableCors: false,         // Production: false (strict)
};
```

### Session Management
```typescript
const security = {
  sessionTimeout: 3600000,   // 1 hour
  maxLoginAttempts: 5,       // Development: 5, Production: 3
};
```

## Deployment

### Development Deployment
```bash
# Start development server
npm run dev

# Or with specific environment
npm run dev:development
```

### Staging Deployment
```bash
# Build for staging
npm run build:staging

# Deploy to staging server
rsync -avz dist/ user@staging-server:/var/www/staging/

# Or use Docker
docker build --target staging -t novora-frontend:staging .
docker run -p 80:80 novora-frontend:staging
```

### Production Deployment
```bash
# Build for production
npm run build:production

# Deploy to production server
rsync -avz dist/ user@prod-server:/var/www/production/

# Or use Docker
docker build --target production -t novora-frontend:production .
docker run -p 80:80 -p 443:443 novora-frontend:production
```

## Docker Configuration

### Multi-stage Dockerfile
```dockerfile
# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Staging stage
FROM node:18-alpine AS staging
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:staging
EXPOSE 80
CMD ["npm", "run", "preview:staging"]

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:production
EXPOSE 80 443
CMD ["npm", "run", "preview:production"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: .
      target: ${TARGET:-production}
    environment:
      - NODE_ENV=${NODE_ENV:-production}
    ports:
      - "80:80"
      - "443:443"
```

## Environment-Specific Builds

### Development Build
```bash
# Features: All enabled
# Debug: Enabled
# Source maps: Enabled
# Minification: Disabled
# Proxy: Enabled

npm run build:development
```

### Staging Build
```bash
# Features: Most enabled
# Debug: Disabled
# Source maps: Enabled
# Minification: Enabled
# Proxy: Disabled

npm run build:staging
```

### Production Build
```bash
# Features: Based on subscription
# Debug: Disabled
# Source maps: Disabled
# Minification: Enabled
# Proxy: Disabled

npm run build:production
```

## Monitoring and Debugging

### Environment Information
```typescript
import { useEnvironment } from '@/hooks/useEnvironment';

const DebugPanel = () => {
  const { utils } = useEnvironment();
  const devInfo = utils.getDevInfo();
  
  if (!devInfo) return null;
  
  return (
    <div className="debug-panel">
      <h3>Environment Info</h3>
      <pre>{JSON.stringify(devInfo, null, 2)}</pre>
    </div>
  );
};
```

### Logging
```typescript
import { log } from '@/config/environment';

// Different log levels based on environment
log('debug', 'Debug message');    // Only in development
log('info', 'Info message');      // Development and staging
log('warn', 'Warning message');   // All environments
log('error', 'Error message');    // All environments
```

### API Monitoring
```typescript
import { useApi } from '@/hooks/useEnvironment';

const ApiMonitor = () => {
  const { enableLogging, getUrl } = useApi();
  
  const makeRequest = async (endpoint: string) => {
    if (enableLogging) {
      console.log(`Making request to: ${getUrl(endpoint)}`);
    }
    
    // Make the actual request
    const response = await fetch(getUrl(endpoint));
    
    if (enableLogging) {
      console.log(`Response status: ${response.status}`);
    }
    
    return response;
  };
  
  return <div>API Monitor</div>;
};
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   ```bash
   # Check if .env file exists
   ls -la .env*
   
   # Verify variable names start with VITE_
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. **Proxy Not Working**
   ```bash
   # Check if proxy is enabled
   VITE_DEV_PROXY=true
   
   # Verify backend is running
   curl http://localhost:8000/api/v1/health
   ```

3. **Feature Flags Not Working**
   ```typescript
   // Check feature flag configuration
   console.log('Features:', featureFlags);
   console.log('Environment:', getCurrentEnvironment());
   ```

4. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check TypeScript errors
   npm run type-check
   ```

### Debug Mode
```typescript
// Enable debug mode in development
VITE_APP_DEBUG=true

// Use debug utilities
import { debug } from '@/config/environment';
debug('This will only show in development mode');
```

## Best Practices

1. **Environment Separation**
   - Keep development, staging, and production configurations separate
   - Use environment variables for sensitive information
   - Never commit `.env` files to version control

2. **Feature Flags**
   - Use feature flags for new features
   - Test features in staging before production
   - Plan feature rollouts carefully

3. **API Configuration**
   - Use proxy in development for easier debugging
   - Configure proper CORS settings per environment
   - Monitor API performance in production

4. **Security**
   - Enable HTTPS in staging and production
   - Restrict CORS in production
   - Use secure session management

5. **Performance**
   - Enable source maps in development only
   - Use proper build optimizations per environment
   - Monitor bundle sizes and performance

## Support

For environment configuration issues:

1. Check the environment files are properly configured
2. Verify Vite configuration is correct
3. Check browser console for errors
4. Review the environment configuration guide
5. Check backend API connectivity
