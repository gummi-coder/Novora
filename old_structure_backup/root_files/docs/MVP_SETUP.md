# Novora MVP Setup Guide

## Overview

This guide explains how to use the MVP-AOBI build profile to deploy a lean version of Novora with only core features enabled.

## What is MVP-AOBI?

MVP-AOBI (Minimum Viable Product - All Out But In) is a feature-gated build profile that:

- **Keeps all code** but gates features at runtime
- **Enables only core functionality** for faster deployment
- **Reduces bundle size** by excluding heavy components
- **Maintains one codebase** to prevent drift

## Core MVP Features

### ✅ Enabled
- Basic survey creation and management
- Survey response collection
- Dashboard analytics (basic trends)
- Alert system
- ENPS integration
- Authentication and user management

### ❌ Disabled
- Advanced analytics and predictive features
- Photo-based surveys
- Auto-pilot functionality
- Admin dashboard
- Export features
- Third-party integrations
- NLP sentiment analysis

## Quick Start

### 1. Build MVP Frontend
```bash
cd frontend
npm run build:mvp
```

### 2. Run MVP Backend
```bash
cd backend
# Load MVP environment
export $(cat .env.mvp | xargs)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Deploy Full MVP Stack
```bash
./scripts/deploy-mvp.sh
```

## Environment Files

### Frontend (.env.mvp)
```env
VITE_PROFILE=MVP_AOBI
VITE_FEATURE_OWNER=false
VITE_FEATURE_ADMIN=false
VITE_FEATURE_PRO=false
VITE_FEATURE_PREDICTIVE=false
VITE_FEATURE_PHOTO=false
VITE_FEATURE_AUTOPILOT=false
VITE_FEATURE_EXPORTS=false
VITE_FEATURE_ENPS=true
VITE_FEATURE_ADVANCED_ANALYTICS=false
VITE_FEATURE_INTEGRATIONS=false
VITE_FEATURE_NLP=false
```

### Backend (.env.mvp)
```env
PROFILE=MVP_AOBI
FEATURE_ADVANCED=false
FEATURE_EXPORTS=false
FEATURE_INTEGRATIONS=false
FEATURE_NLP_PII=true
FEATURE_NLP_SENTIMENT=false
FEATURE_AUTOPILOT=false
FEATURE_ADMIN=false
FEATURE_PRO=false
FEATURE_PHOTO=false
```

## Feature Gating System

### Frontend Feature Gates

#### 1. Route-Level Gating
```tsx
// FeatureGatedRouter.tsx
{__FEATURE_PHOTO__ && (
  <Route path="/photo" element={<PhotoSurveyDemo />} />
)}
```

#### 2. Component-Level Gating
```tsx
import FeatureGate from '@/components/FeatureGate';

<FeatureGate feature="photo" fallback={<UpgradePrompt />}>
  <PhotoSurveyComponent />
</FeatureGate>
```

#### 3. Hook-Based Gating
```tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const { features } = useFeatureFlags();
if (features.photo) {
  // Photo feature logic
}
```

### Backend Feature Gates

#### 1. Router-Level Gating
```python
# api.py
if os.getenv("FEATURE_ADVANCED", "false") == "true":
    api_router.include_router(advanced_analytics_router)
```

#### 2. Endpoint-Level Gating
```python
from app.core.feature_flags import require_feature

@require_feature("advanced_analytics")
async def advanced_analytics_endpoint():
    # Advanced analytics logic
```

## Bundle Optimization

### Frontend
- **Manual chunks**: Survey builder isolated into separate bundle
- **Lazy loading**: Feature-gated routes loaded on demand
- **Tree shaking**: Unused features excluded from build

### Backend
- **Conditional imports**: Heavy modules only imported when needed
- **Router gating**: Unused endpoints not registered
- **Service gating**: Background tasks only scheduled when enabled

## Testing

### MVP Smoke Test
```bash
python tests/mvp-smoke-test.py
```

Tests core functionality:
1. Health check
2. Authentication
3. Survey creation
4. Token generation
5. Response submission
6. Dashboard aggregation
7. Alert system

### Bundle Size Check
```bash
# Check main bundle size (should be < 200KB gzipped)
npm run build:mvp
ls -la frontend/dist/assets/main.*.js
```

## Migration to Full Version

To enable all features:

1. **Frontend**: Remove `.env.mvp` or set all features to `true`
2. **Backend**: Remove `.env.mvp` or set all features to `true`
3. **Rebuild**: Run standard build commands

```bash
# Frontend
npm run build

# Backend
python -m uvicorn app.main:app
```

## Benefits

### Development
- **Faster builds**: Smaller bundle, fewer dependencies
- **Focused testing**: Core functionality only
- **Reduced complexity**: Fewer moving parts

### Deployment
- **Smaller footprint**: Reduced server resources
- **Faster startup**: Fewer services to initialize
- **Lower costs**: Minimal infrastructure requirements

### Business
- **Faster time to market**: Core features only
- **Proven value**: Focus on essential functionality
- **Gradual rollout**: Enable features as needed

## Troubleshooting

### Common Issues

1. **Feature not working**: Check environment file and feature flags
2. **Build errors**: Ensure all feature-gated imports are conditional
3. **Bundle too large**: Verify manual chunks and tree shaking
4. **Backend errors**: Check router gating and conditional imports

### Debug Commands
```bash
# Check feature flags
echo $VITE_PROFILE
echo $FEATURE_ADVANCED

# Check bundle size
npm run build:mvp && du -h frontend/dist/assets/*.js

# Test specific feature
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/admin
```

## Next Steps

1. **Deploy MVP**: Use `./scripts/deploy-mvp.sh`
2. **Validate core features**: Run smoke test
3. **Gather feedback**: Focus on essential functionality
4. **Enable features**: Gradually turn on advanced features
5. **Scale up**: Migrate to full version when ready
