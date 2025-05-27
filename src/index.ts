import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import proxy from '@fastify/http-proxy';
import { serviceRoutes } from './config/services';
import authRoutes from './routes/auth';

const app = Fastify({ logger: true });

// Rate limiting
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Swagger/OpenAPI
app.register(swagger, {
  openapi: {
    info: {
      title: 'API Gateway',
      version: '1.0.0'
    }
  }
});
app.register(swaggerUI, { routePrefix: '/docs' });

// Register routes
app.register(authRoutes, { prefix: '/auth' });

// Proxy routes for each service
for (const [prefix, target] of Object.entries(serviceRoutes)) {
  app.register(proxy, {
    upstream: target,
    prefix,
    rewritePrefix: prefix,
    http2: false
  });
}

// Custom validation/error middleware can be added here

app.listen({ port: 3000 }, err => {
  if (err) throw err;
  console.log('API Gateway running on http://localhost:3000');
}); 