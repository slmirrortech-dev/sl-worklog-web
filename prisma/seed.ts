// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TOTAL_WORKERS = 100
const ADMIN_NAMES = ['김관리', '이관리']
const PASSWORD_PLAIN = '0000'

// 작업자 이름 생성용 성(姓) 목록: 순환하며 "성+작업" 이름으로 만듦
const FAMILY_NAMES = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '윤',
  '장',
  '강',
  '조',
  '임',
  '오',
  '한',
  '서',
  '신',
  '권',
  '황',
  '안',
  '송',
  '유',
  '홍',
  '고',
  '문',
  '양',
  '손',
  '배',
  '백',
  '허',
  '노',
  '남',
  '심',
]

// 100000 ~ 999999 범위 6자리 랜덤 사번
function randomLoginId(): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return String(n)
}

// 중복 없는 loginId 리스트 생성
function generateUniqueLoginIds(count: number, existing = new Set<string>()) {
  const ids = new Set<string>()
  while (ids.size < count) {
    const id = randomLoginId()
    if (!ids.has(id) && !existing.has(id)) ids.add(id)
  }
  return Array.from(ids)
}

async function main() {
  console.log('🚨 DEV ONLY: 기존 사용자 삭제 중...')
  await prisma.user.deleteMany({})

  const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10)

  // 혹시 모를 기존 loginId 확보(여긴 비어있겠지만 안전하게)
  const existingIds = new Set<string>(
    (await prisma.user.findMany({ select: { loginId: true } })).map((u) => u.loginId),
  )

  // 총 생성 수(관리자 2 + 작업자 100)
  const total = ADMIN_NAMES.length + TOTAL_WORKERS
  const uniqueLoginIds = generateUniqueLoginIds(total, existingIds)

  // 로그인ID 할당: 앞 2개는 관리자, 나머지는 작업자
  const adminLoginIds = uniqueLoginIds.slice(0, ADMIN_NAMES.length)
  const workerLoginIds = uniqueLoginIds.slice(ADMIN_NAMES.length)

  // 관리자 2명: 김관리(슈퍼), 이관리
  const admins = adminLoginIds.map((id, i) => ({
    loginId: id,
    password: passwordHash,
    name: ADMIN_NAMES[i],
    role: 'ADMIN' as const,
    isSuperAdmin: i === 0, // 첫 번째만 true
  }))

  // 작업자 100명: 성 목록을 순환하며 "성+작업" 이름 생성 (예: 김작업, 최작업, 윤작업 ...)
  const workers = Array.from({ length: TOTAL_WORKERS }, (_, idx) => {
    const family = FAMILY_NAMES[idx % FAMILY_NAMES.length]
    return {
      loginId: workerLoginIds[idx],
      password: passwordHash,
      name: `${family}작업`,
      role: 'WORKER' as const,
      isSuperAdmin: false,
    }
  })

  // 삽입
  await prisma.user.createMany({ data: admins })
  await prisma.user.createMany({ data: workers })

  // 결과 출력
  console.log('✅ Seed complete')
  console.log('👑 Admins')
  admins.forEach((a) =>
    console.log(
      `- ${a.name} / loginId: ${a.loginId} / pw: ${PASSWORD_PLAIN} / super: ${a.isSuperAdmin}`,
    ),
  )
  console.log('👷 Workers (first 10 of 100)')
  workers
    .slice(0, 10)
    .forEach((w) => console.log(`- ${w.name} / loginId: ${w.loginId} / pw: ${PASSWORD_PLAIN}`))
  console.log(`…and ${workers.length - 10} more workers.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
