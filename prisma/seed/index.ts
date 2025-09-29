import { PrismaClient } from '@prisma/client'
import { seedUsers } from './seedUsers'
import { seedLines } from './seedLines'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Seed 데이터 생성 시작...')

  // seedUsers는 로컬 환경에서만 실행 (DATABASE_URL로 production 환경 판단)
  const isProduction = process.env.DATABASE_URL?.includes('supabase.com') ||
                      process.env.DATABASE_URL?.includes('production')

  if (!isProduction) {
    console.log('📝 seedUsers 실행 (로컬 환경)')
    await seedUsers()
  } else {
    console.log('🚫 seedUsers 건너뜀 (운영 환경)')
  }

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
