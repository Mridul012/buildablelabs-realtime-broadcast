import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  const users = await prisma.user.createMany({
    data: [{ username: 'creator' }, { username: 'viewer' }],
    skipDuplicates: true,
  });

  console.log(`Created ${users.count} user(s)`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
