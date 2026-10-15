import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // We can't really seed a specific order because variant IDs depend on the catalog DB.
  // We will just leave it empty for now, or you can create one programmatically later.
  console.log('Order Database ready. Seeded 0 records.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
