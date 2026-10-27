import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  const code = 'halloween_night'.trim().toLowerCase();
  const coupon = await prisma.coupon.upsert({
    where: { code },
    update: {
      type: 'flat',
      value: 180,
      active: true,
      maxUses: null,
      expiresAt: null,
    },
    create: {
      code,
      type: 'flat',
      value: 180,
      active: true,
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
    },
  });

  console.log('Seeded coupon:', {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    active: coupon.active,
    maxUses: coupon.maxUses,
    usedCount: coupon.usedCount,
    expiresAt: coupon.expiresAt,
  });

  await prisma.$disconnect();
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
