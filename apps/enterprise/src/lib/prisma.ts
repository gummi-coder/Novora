import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Query logging
prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', e.duration, 'ms');
  console.log('Timestamp:', new Date().toISOString());
});

// Error logging
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e.message);
  console.error('Timestamp:', new Date().toISOString());
}); 