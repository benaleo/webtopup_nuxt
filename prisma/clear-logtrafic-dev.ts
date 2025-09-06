import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all log trafic with url localhost
  const deletedLogTrafic = await prisma.logTrafic.deleteMany({
    where: {
      url: {
        contains: "localhost",
      },
    },
  });
  
  console.log(`Successfully deleted ${deletedLogTrafic.count} log trafic`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
