// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TOTAL_WORKERS = 100
const ADMIN_NAMES = ['김관리', '이관리']
const PASSWORD_PLAIN = '0000'

// 작업자 이름 생성용 성(姓) 목록
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

// 라인/공정 데이터 (25개 라인)
const LINES = [
  'MV L/R',
  'MX5 LH',
  'MX5 RH',
  'MQ4 LH',
  'MQ4 RH',
  'AX/CV/SG2 LH',
  'AX/CV/SG2 RH',
  'SW L/R',
  'LB L/R',
  'NX4A L/R',
  'NQ5 LH',
  'NQ5 RH',
  'C121 L/R',
  'OV1K L/R',
  'LQ2 L/R',
  'JA/YB LH',
  'JA/YB RH',
  'SV/CT/NH2 LH',
  'SV/CT/NH2 RH',
  'ME L/R',
  '프리미엄 A',
  '프리미엄 B',
  'CMS',
  'ETCS',
  '린지원',
]

// 린지원 전용 프로세스
const SUPPORT_PROCESSES = ['서열피더', '조립피더', '리워크', '폴리싱', '서열대차']

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

async function seedUsers() {
  const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10)

  // 관리자
  const admins = ADMIN_NAMES.map((name, i) => ({
    loginId: i === 0 ? 'admin' : `admin${i + 1}`,
    password: passwordHash,
    name,
    role: 'ADMIN' as const,
  }))

  // 👉 관리자 아이디를 existing 세트에 넣어줌
  const existing = new Set(admins.map((a) => a.loginId))

  // 작업자
  const workerLoginIds = generateUniqueLoginIds(TOTAL_WORKERS, existing)
  const workers = Array.from({ length: TOTAL_WORKERS }, (_, idx) => {
    const family = FAMILY_NAMES[idx % FAMILY_NAMES.length]
    return {
      loginId: workerLoginIds[idx],
      password: passwordHash,
      name: `${family}작업`,
      role: 'WORKER' as const,
    }
  })

  await prisma.user.createMany({ data: admins, skipDuplicates: true })
  await prisma.user.createMany({ data: workers, skipDuplicates: true })

  console.log(`👑 Admins: ${admins.length}, 👷 Workers: ${workers.length}`)
}

async function seedLinesAndProcesses() {
  for (let i = 0; i < LINES.length; i++) {
    const lineName = LINES[i]

    // 린지원 라인인지 확인
    const processes =
      lineName === '린지원'
        ? SUPPORT_PROCESSES.map((name, idx) => ({ name, order: idx + 1 }))
        : Array.from({ length: 7 }, (_, idx) => ({
            name: `P${idx + 1}`,
            order: idx + 1,
          }))

    await prisma.line.create({
      data: {
        name: lineName,
        order: i + 1,
        processes: { create: processes },
      },
    })
  }

  console.log(`📦 Lines + Processes seeded: ${LINES.length}`)
}

async function seedWorkLogs() {
  const firstWorker = await prisma.user.findFirst({ where: { role: 'WORKER' } })
  const firstProcess = await prisma.process.findFirst()

  if (firstWorker && firstProcess) {
    await prisma.workLog.create({
      data: {
        userId: firstWorker.id,
        processId: firstProcess.id,
        startedAt: new Date(),
      },
    })
    console.log(`📝 WorkLog created for ${firstWorker.name} at process ${firstProcess.name}`)
  }
}

async function main() {
  console.log('🚀 Seed 데이터 생성 시작...')
  await prisma.workLog.deleteMany({})
  await prisma.process.deleteMany({})
  await prisma.line.deleteMany({})
  await prisma.user.deleteMany({})

  await seedUsers()
  await seedLinesAndProcesses()
  await seedWorkLogs()

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
