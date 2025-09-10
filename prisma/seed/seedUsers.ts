import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TOTAL_WORKERS = 100
const ADMIN_NAMES = ['김관리', '이관리']
const MANAGER_DATA = { name: '김영애', userId: 'manager', birthday: '19970317' }

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

// 100000 ~ 999999 범위 6자리 랜덤 사번
function randomLoginId(): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return String(n)
}

// 랜덤한 8자리 생년월일 생성
function randomBirthday(): string {
  const year = Math.floor(Math.random() * 40) + 1960 // 1960~1999년생
  const month = Math.floor(Math.random() * 12) + 1 // 1~12월
  const day = Math.floor(Math.random() * 28) + 1 // 1~28일

  const yearStr = year.toString() // 4자리
  const monthStr = month.toString().padStart(2, '0')
  const dayStr = day.toString().padStart(2, '0')

  return `${yearStr}${monthStr}${dayStr}`
}

// 중복 없는 userId 리스트 생성
function generateUniqueUserIds(count: number, existing = new Set<string>()) {
  const ids = new Set<string>()
  while (ids.size < count) {
    const id = randomLoginId()
    if (!ids.has(id) && !existing.has(id)) ids.add(id)
  }
  return Array.from(ids)
}

/**
 * 사용자 계정 시드
 **/
export async function seedUsers() {
  // 관리자는 고정된 생년월일과 비밀번호 사용
  const adminBirthday = '19970426'
  const adminPasswordHash = await bcrypt.hash(adminBirthday, 10)

  // 관리자
  const admins = ADMIN_NAMES.map((name, i) => ({
    userId: i === 0 ? 'admin' : `admin${i + 1}`,
    password: adminPasswordHash,
    name,
    birthday: adminBirthday,
    role: Role.ADMIN,
    isActive: true,
  }))

  // 매니저
  const managerPasswordHash = await bcrypt.hash(MANAGER_DATA.birthday, 10)
  const manager = {
    userId: MANAGER_DATA.userId,
    password: managerPasswordHash,
    name: MANAGER_DATA.name,
    birthday: MANAGER_DATA.birthday,
    role: Role.MANAGER,
    isActive: true,
  }

  // 관리자와 매니저 아이디를 existing 세트에 넣어줌
  const existing = new Set([...admins.map((a) => a.userId), manager.userId])

  // 작업자
  const workerLoginIds = generateUniqueUserIds(TOTAL_WORKERS, existing)
  const workers = await Promise.all(
    Array.from({ length: TOTAL_WORKERS }, async (_, idx) => {
      const family = FAMILY_NAMES[idx % FAMILY_NAMES.length]
      const birthday = randomBirthday()
      const passwordHash = await bcrypt.hash(birthday, 10)
      return {
        userId: workerLoginIds[idx],
        password: passwordHash,
        name: `${family}작업`,
        birthday,
        role: Role.WORKER,
        isActive: true,
      }
    }),
  )

  await prisma.user.createMany({ data: admins, skipDuplicates: true })
  await prisma.user.create({ data: manager })
  await prisma.user.createMany({ data: workers, skipDuplicates: true })

  console.log(`👑 Admins: ${admins.length}, 👨‍💼 Manager: 1, 👷 Workers: ${workers.length}`)

  return prisma.user.findMany()
}
