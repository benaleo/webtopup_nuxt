import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all vouchers
  const deletedVouchers = await prisma.voucher.deleteMany({});
  
  console.log(`Successfully deleted ${deletedVouchers.count} vouchers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
