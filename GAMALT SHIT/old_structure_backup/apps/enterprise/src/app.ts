import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';
import { requireAuth } from './middleware/authMiddleware';
import { requireSubscription } from './middleware/subscriptionMiddleware';
import { requireFeature } from './middleware/featureFlagMiddleware';
import usageRoutes from './routes/usageRoutes';
import featureFlagRoutes from './routes/featureFlagRoutes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', require('./routes/authRoutes'));

// Feature flag management routes (admin only)
app.use('/api/features', featureFlagRoutes);

// Protected routes (auth required)
app.use('/api/usage', requireAuth, rateLimitMiddleware, usageRoutes);

// Enterprise-only routes with feature flags
app.use('/api/analytics/advanced', 
  requireAuth, 
  rateLimitMiddleware, 
  requireSubscription('enterprise'),
  requireFeature('advanced-analytics'),
  require('./routes/analyticsRoutes')
);

// Pro and Enterprise routes with feature flags
app.use('/api/team', 
  requireAuth, 
  rateLimitMiddleware, 
  requireSubscription('pro'),
  requireFeature('team-management'),
  require('./routes/teamRoutes')
);

app.use('/api/integrations', 
  requireAuth, 
  rateLimitMiddleware, 
  requireSubscription('pro'),
  requireFeature('api-access'),
  require('./routes/integrationRoutes')
);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 