import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured.');
  // Supabase pooler certificates chain through an intermediate that Node's pg
  // driver does not trust in every serverless runtime. This keeps TLS enabled
  // while allowing that known hosted chain; access remains limited by network,
  // database credentials, and the RLS/public-API restrictions in prisma/rls.sql.
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 1,
      ssl: { rejectUnauthorized: false },
    }),
  });
}

export const prisma = globalForPrisma.vulcanPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.vulcanPrisma = prisma;
