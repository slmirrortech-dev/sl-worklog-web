import { PrismaClient } from '@prisma/client'
import { seedInitialAdmin } from './seedInitialAdmin'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seed 데이터 생성 시작...\n')

  // 초기 관리자 등록
  await seedInitialAdmin()

  // await seedLines()

  console.log('\n✅ Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
