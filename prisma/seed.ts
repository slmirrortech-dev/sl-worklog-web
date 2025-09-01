// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('0000', 10)

  await prisma.user.upsert({
    where: { loginId: 'admin' },
    update: {},
    create: {
      loginId: 'admin',
      password: hash,
      name: '최고관리자',
      role: 'ADMIN',
      isSuperAdmin: true,
    },
  })
}

main()
  .then(() => console.log('✅ Seed complete'))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
