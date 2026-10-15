import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.discountCoupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      validFrom: new Date(),
    },
  });

  console.log('Seeded Marketing Database with 1 discount coupon.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
