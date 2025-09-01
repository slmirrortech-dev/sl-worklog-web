// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('0000', 10)

  // 관리자 계정
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

  // 테스트 작업자 계정들
  await prisma.user.upsert({
    where: { loginId: 'worker01' },
    update: {},
    create: {
      loginId: 'worker01',
      password: hash,
      name: '김작업자',
      role: 'WORKER',
      isSuperAdmin: false,
    },
  })

  await prisma.user.upsert({
    where: { loginId: 'worker02' },
    update: {},
    create: {
      loginId: 'worker02',
      password: hash,
      name: '이작업자',
      role: 'WORKER',
      isSuperAdmin: false,
    },
  })

  console.log('👤 Created users:')
  console.log('- admin (관리자)')
  console.log('- worker01 (김작업자)')
  console.log('- worker02 (이작업자)')
  console.log('📝 All passwords: 0000')
}

main()
  .then(() => console.log('✅ Seed complete'))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
