import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USERNAME
  const password = process.env.ADMIN_PASSWORD
  const name = 'Administrator'

  if (!username || !password) {
    console.log('ADMIN_USERNAME or ADMIN_PASSWORD not set. Skipping admin seed.')
    return
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    console.log('Admin user already exists, skipping create.')
    return
  }

  const hash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name,
      username,
      password: hash,
      role: Role.SUPERADMIN,
      is_active: true,
    },
  })
  console.log('Admin user created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
