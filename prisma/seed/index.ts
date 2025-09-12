import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seedUsers'
import { seedLines } from './seedLines'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seed 데이터 생성 시작...')
  await seedUsers()
  await seedLines()

  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
