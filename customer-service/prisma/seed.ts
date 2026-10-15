import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL || 'postgresql://postgres:james@localhost:5432/customer_db?schema=public'}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log(`Customer database already has ${count} users, skipping seed.`);
    return;
  }

  await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: 'password123',
      role: 'CUSTOMER',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '555-1234',
        }
      },
      addresses: {
        create: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90210',
          country: 'USA',
          isDefault: true,
        }
      }
    },
  });

  console.log('Seeded Customer Database with 1 test user.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
