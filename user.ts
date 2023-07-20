import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // prisma.productImages
  const usersWithPosts = await prisma.product.findMany({
    include: {
      images: true,
    },
  });
  console.dir(usersWithPosts, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
