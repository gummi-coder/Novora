import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface MigrationOptions {
  environment: 'development' | 'staging' | 'production';
  backup?: boolean;
  seed?: boolean;
}

async function backupDatabase(environment: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups');
  const backupFile = path.join(backupDir, `backup-${environment}-${timestamp}.sql`);

  // Ensure backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Get database URL from environment
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Parse database URL to get connection details
  const url = new URL(dbUrl);
  const dbName = url.pathname.slice(1);
  const dbHost = url.hostname;
  const dbPort = url.port;
  const dbUser = url.username;
  const dbPassword = url.password;

  // Create backup using pg_dump
  const backupCommand = `PGPASSWORD=${dbPassword} pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f ${backupFile}`;
  
  try {
    await execAsync(backupCommand);
    console.log(`Database backup created at: ${backupFile}`);
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

async function runMigrations(options: MigrationOptions): Promise<void> {
  const { environment, backup = true, seed = false } = options;

  try {
    // Create backup if requested and in production/staging
    if (backup && (environment === 'production' || environment === 'staging')) {
      await backupDatabase(environment);
    }

    // Run Prisma migrations
    console.log('Running database migrations...');
    await execAsync('npx prisma migrate deploy');

    // Generate Prisma Client
    console.log('Generating Prisma Client...');
    await execAsync('npx prisma generate');

    // Run seeds if requested
    if (seed && environment !== 'production') {
      console.log('Running database seeds...');
      await execAsync('npx prisma db seed');
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export the migration function
export { runMigrations };

// Allow running directly from command line
if (require.main === module) {
  const environment = process.env.NODE_ENV || 'development';
  runMigrations({ environment })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 