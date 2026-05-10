
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await (prisma as any).userPassword.findMany()
  console.log('UserPasswords:', users)
  
  const userTable = await prisma.user.findMany()
  console.log('Users in User table:', userTable)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
