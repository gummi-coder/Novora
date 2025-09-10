# API Documentation

This directory contains the API documentation for all services in the project. The documentation is generated from OpenAPI/Swagger specifications and includes detailed information about endpoints, authentication, and usage examples.

## API Specifications

- [Authentication API](./auth/README.md)
- [User Management API](./users/README.md)
- [Dashboard API](./dashboard/README.md)
- [Analytics API](./analytics/README.md)

## OpenAPI/Swagger Setup

### Generating Documentation

1. Install dependencies:
   ```bash
   npm install --save-dev swagger-jsdoc swagger-ui-express
   ```

2. Add to your package.json:
   ```json
   {
     "scripts": {
       "docs:generate": "swagger-jsdoc -d swaggerDef.js -o swagger.json",
       "docs:serve": "swagger-ui-express swagger.json"
     }
   }
   ```

3. Create swaggerDef.js:
   ```javascript
   module.exports = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'API Documentation',
         version: '1.0.0',
         description: 'API documentation for the project',
       },
       servers: [
         {
           url: 'http://localhost:3000',
           description: 'Development server',
         },
         {
           url: 'https://api.example.com',
           description: 'Production server',
         },
       ],
     },
     apis: ['./src/routes/*.js'], // Path to the API routes
   };
   ```

### Documenting Endpoints

Use JSDoc comments to document your endpoints:

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
```

## API Versioning

We use semantic versioning for our APIs:

- Major version changes (v1 → v2) indicate breaking changes
- Minor version changes (v1.0 → v1.1) indicate new features
- Patch version changes (v1.0.0 → v1.0.1) indicate bug fixes

## Authentication

All API endpoints require authentication unless explicitly marked as public. We use JWT tokens for authentication.

### Getting a Token

```bash
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

### Using the Token

```bash
curl https://api.example.com/users \
  -H "Authorization: Bearer <your-token>"
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Error Handling

All API errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      // Additional error details
    }
  }
}
```

## Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Testing the API

You can test the API using:

1. Swagger UI (available at `/api-docs`)
2. Postman collection (available in `docs/api/postman`)
3. cURL examples in each endpoint's documentation

## Contributing to API Documentation

1. Document all new endpoints using OpenAPI/Swagger annotations
2. Include example requests and responses
3. Update this README when adding new features
4. Test all documentation examples
5. Keep the Postman collection up to date 