# Novora Environment Setup & Development Workflow

## 🎯 **Environment Matrix**

### **Environment Files Created:**

| Environment | File | API Mode | Base URL | Database |
|-------------|------|----------|----------|----------|
| **Local Mock** | `env.local-mock` | `mock` | `http://localhost:8000` | `localhost:5432` |
| **Local Connected** | `env.local-connected` | `connected` | `http://localhost:8000` | `localhost:5432` |
| **Staging** | `env.staging` | `connected` | `https://staging.api.novora.local` | `staging-db:5432` |
| **Pilot** | `env.pilot` | `connected` | `https://pilot.api.novora.app` | `pilot-db:5432` |

### **Frontend API Client Configuration:**

The frontend automatically switches between mock and real API based on the `NEXT_PUBLIC_API_MODE` environment variable:

```typescript
// src/services/apiClient.ts
export const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'mock';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Import mock and real services
import * as mock from './mocks';
import * as real from './real';

// Export the service based on API mode
export const svc = API_MODE === 'connected' ? real : mock;
```

## 🚀 **Development Commands**

### **Quick Start (Recommended):**
```bash
# Start full development environment with smoke test
./dev.sh
```

### **Individual Commands:**

#### **Backend:**
```bash
# Start backend server
make dev-be

# Seed database
make seed

# Run smoke test
make smoke-test
```

#### **Frontend:**
```bash
# Start with mock data
npm run dev:mock

# Start connected to real API
npm run dev:connected

# Start with specific environment
npm run dev:development
npm run dev:staging
npm run dev:production
```

#### **Full Development Environment:**
```bash
# Start backend, seed, and frontend
make dev-full

# Complete setup with smoke test
make dev
```

## 📁 **Project Structure**

```
Novora/
├── env.local-mock          # Local development with mock data
├── env.local-connected     # Local development with real API
├── env.staging            # Staging environment
├── env.pilot              # Pilot environment
├── Makefile               # Development commands
├── dev.sh                 # Quick start script
├── backend/
│   ├── scripts/
│   │   └── seed_base.py   # Database seeding script
│   └── app/core/
│       └── privacy.py     # Privacy rules configuration
└── frontend/
    ├── src/services/
    │   ├── apiClient.ts   # API client with mode switching
    │   ├── mocks/         # Mock service implementations
    │   └── real/          # Real API service implementations
    └── package.json       # Updated with new scripts
```

## 🔧 **Configuration Details**

### **Privacy Rules:**
```python
# backend/app/core/privacy.py
@dataclass
class PrivacyRules:
    min_n: int = 5
    min_segment_n: int = 5

RULES = PrivacyRules()
```

### **Database Seeding:**
The seed script creates:
- 3 sample organizations (Acme 1, 2, 3)
- 2 users per org (owner + HR admin)
- 20-60 employees per org
- 5 monthly surveys per org
- Realistic response data with comments

### **API Mode Switching:**
- **Mock Mode**: Uses local mock data for development
- **Connected Mode**: Connects to real backend API
- **Automatic**: Frontend automatically switches based on environment

## 🎯 **Development Workflows**

### **1. Mock Development (Fast Iteration):**
```bash
# Use mock data for rapid frontend development
npm run dev:mock
```

### **2. Connected Development (Full Stack):**
```bash
# Start complete environment
./dev.sh
```

### **3. Backend-Only Development:**
```bash
# Focus on backend development
make dev-be
```

### **4. Database Seeding:**
```bash
# Seed fresh data
make seed
```

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Port Already in Use:**
   ```bash
   lsof -i :3000  # Check frontend port
   lsof -i :8000  # Check backend port
   ```

2. **Database Issues:**
   ```bash
   make clean    # Clean up database
   make seed     # Re-seed data
   ```

3. **Dependencies:**
   ```bash
   make install  # Install all dependencies
   ```

### **Environment Variables:**

To use a specific environment file:
```bash
# Copy environment file
cp env.local-mock .env

# Or set environment variable
export NEXT_PUBLIC_API_MODE=mock
```

## 📊 **Smoke Test**

The development environment includes automatic smoke testing:
```bash
# Manual smoke test
make smoke-test

# Automatic smoke test in dev.sh
curl -sf http://localhost:8000/api/v1/health
```

## 🎉 **Ready to Develop!**

Your Novora development environment is now fully configured with:

- ✅ **Environment Matrix**: Mock/Connected switching
- ✅ **API Client**: Automatic mode switching
- ✅ **Database Seeding**: Sample data generation
- ✅ **Development Scripts**: Easy startup commands
- ✅ **Privacy Rules**: Configuration for data protection
- ✅ **Smoke Testing**: Health check automation

**Start developing with:** `./dev.sh`
