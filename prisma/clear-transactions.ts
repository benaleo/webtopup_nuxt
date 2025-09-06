import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all transactions
  const deletedTransactions = await prisma.transaction.deleteMany({});
  
  console.log(`Successfully deleted ${deletedTransactions.count} transactions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
