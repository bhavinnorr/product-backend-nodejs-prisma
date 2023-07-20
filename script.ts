import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    var today = new Date();
var dd = String(today.toISOString());
  const user = await prisma.users.create({
    data: {
        name: 'Al',
        email: 'alice@prisma.io',
        password: 'abcd123',
        remember_token: '123'
    },
  })
  console.log(user)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })