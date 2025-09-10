# API Versioning Strategy

This document outlines our API versioning strategy, which is designed to support long-term growth, client stability, and safe evolution of our platform's backend services.

## Versioning Approaches

We support three versioning strategies:

1. **URL-based** (default): `/v1/users`, `/v2/users`
2. **Header-based**: `X-API-Version: v1`
3. **Subdomain-based**: `v1.api.example.com`, `v2.api.example.com`

The strategy can be configured using the `API_VERSION_STRATEGY` environment variable.

## Version Lifecycle

Each API version goes through the following lifecycle:

1. **Active**: The version is fully supported and recommended for new integrations
2. **Deprecated**: The version is still supported but will be sunset in the future
3. **Sunset**: The version is no longer supported and will return 410 Gone

### Timeline

- **Deprecation Period**: 180 days (configurable via `API_DEPRECATION_PERIOD`)
- **Sunset Period**: 90 days after deprecation (configurable via `API_SUNSET_PERIOD`)

## Version Management

### Creating a New Version

1. Create a new version branch
2. Implement new features/changes
3. Update version configuration
4. Deploy and test
5. Update documentation

### Deprecating a Version

1. Mark version as deprecated using `deprecateVersion()`
2. Set sunset date
3. Notify users via email and documentation
4. Monitor usage and assist with migration

### Sunsetting a Version

1. Mark version as sunset using `sunsetVersion()`
2. Remove version from active support
3. Archive documentation
4. Monitor for any remaining usage

## Documentation

Each API version has its own documentation:

- URL: `/{version}/docs`
- Swagger UI: `/{version}/docs/swagger`
- OpenAPI spec: `/{version}/docs/openapi.json`

## Best Practices

### For API Developers

1. **Backward Compatibility**
   - Add new fields without removing existing ones
   - Use optional parameters for new features
   - Maintain consistent response structures

2. **Breaking Changes**
   - Document all breaking changes
   - Provide migration guides
   - Consider creating a new version

3. **Version Management**
   - Keep versions active for at least 1 year
   - Provide 6 months notice before deprecation
   - Support at least 2 active versions

### For API Consumers

1. **Version Selection**
   - Use the latest stable version for new projects
   - Monitor version status via `/api/versions`
   - Plan for version upgrades

2. **Migration Planning**
   - Start migration when a version is deprecated
   - Complete migration before sunset date
   - Test thoroughly in staging environment

## Configuration

Environment variables for API versioning:

```env
API_VERSION_STRATEGY=url
API_DEFAULT_VERSION=v1
API_DEPRECATION_PERIOD=180
API_SUNSET_PERIOD=90
API_ENABLE_VERSION_DOCS=true
API_DOCS_PATH=/docs
API_VERSION_HEADER=X-API-Version
API_DEPRECATED_HEADER=X-API-Deprecated
API_SUNSET_HEADER=X-API-Sunset
```

## Response Headers

The API includes version information in response headers:

- `X-API-Version`: Current API version
- `X-API-Deprecated`: Present if version is deprecated
- `X-API-Deprecated-Date`: Date when version was deprecated
- `X-API-Sunset-Date`: Date when version will be sunset

## Error Handling

Version-related errors:

- `400 Bad Request`: Invalid version specified
- `410 Gone`: Version has been sunset
- `426 Upgrade Required`: Version is deprecated

## Examples

### URL-based Versioning

```bash
# v1 API
GET /v1/users
GET /v1/users/123

# v2 API
GET /v2/users
GET /v2/users/123
```

### Header-based Versioning

```bash
# v1 API
GET /users
X-API-Version: v1

# v2 API
GET /users
X-API-Version: v2
```

### Subdomain-based Versioning

```bash
# v1 API
GET https://v1.api.example.com/users

# v2 API
GET https://v2.api.example.com/users
```

## Support

For questions about API versioning:

- Email: api-support@example.com
- Documentation: /docs/api/versioning
- Status: /api/versions 