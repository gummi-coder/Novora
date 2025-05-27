# Database Migration Strategy

This directory contains the database migration and seeding system for the application. The system is built using Prisma and includes tools for safe schema evolution, data backup, and seeding.

## Directory Structure

```
prisma/
├── migrations/     # Generated migration files
├── seeds/         # Seed data for development/staging
├── backups/       # Database backups
├── schema.prisma  # Prisma schema definition
└── migrate.ts     # Migration script
```

## Migration Workflow

### Development

1. Make changes to `schema.prisma`
2. Create a migration:
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```
3. Apply the migration:
   ```bash
   npm run migrate:dev
   ```

### Staging/Production

1. Create a backup (automatically handled by migrate script):
   ```bash
   npm run migrate:staging
   # or
   npm run migrate:prod
   ```
2. Apply migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Backup Strategy

- Automatic backups before migrations in staging/production
- Backups stored in `prisma/backups/` with timestamp
- Backup format: `backup-{environment}-{timestamp}.sql`
- Uses `pg_dump` for PostgreSQL backups

## Seeding

### Development

```bash
npm run seed:dev
```

### Staging

```bash
npm run seed:staging
```

### Production

Seeding is disabled in production for safety.

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Database Migration

on:
  push:
    branches: [main, staging]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run migrations
        run: npm run migrate:${{ github.ref == 'refs/heads/main' && 'prod' || 'staging' }}
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Best Practices

1. **Schema Changes**
   - Always create migrations for schema changes
   - Use descriptive migration names
   - Test migrations locally before deploying
   - Review generated SQL in migration files

2. **Data Safety**
   - Always backup before migrations in staging/production
   - Test migrations with production-like data
   - Use transactions for data migrations
   - Have a rollback plan

3. **Development**
   - Keep seed data realistic
   - Use different seed data for different environments
   - Document any special seeding requirements

4. **Production**
   - Schedule migrations during low-traffic periods
   - Monitor migration progress
   - Have a rollback procedure ready
   - Test migrations in staging first

## Troubleshooting

### Common Issues

1. **Migration Conflicts**
   - Reset development database: `npx prisma migrate reset`
   - Check for pending migrations: `npx prisma migrate status`

2. **Backup Issues**
   - Verify database credentials
   - Check disk space
   - Ensure pg_dump is installed

3. **Seeding Problems**
   - Clear existing data first
   - Check for unique constraints
   - Verify relationships

## Maintenance

- Regularly clean up old backups
- Monitor migration history
- Update seed data as needed
- Review and update documentation 