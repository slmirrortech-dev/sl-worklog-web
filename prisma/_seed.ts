// // prisma/seed.ts
// import { PrismaClient, Role, ShiftType } from '@prisma/client'
// import bcrypt from 'bcryptjs'
// import { addMinutes, differenceInMinutes } from 'date-fns'
//
// const prisma = new PrismaClient()
//
// const TOTAL_WORKERS = 100
// const ADMIN_NAMES = ['김관리', '이관리']
// const PASSWORD_PLAIN = '0000'
//
// // 작업자 이름 생성용 성(姓) 목록
// const FAMILY_NAMES = [
//   '김',
//   '이',
//   '박',
//   '최',
//   '정',
//   '윤',
//   '장',
//   '강',
//   '조',
//   '임',
//   '오',
//   '한',
//   '서',
//   '신',
//   '권',
//   '황',
//   '안',
//   '송',
//   '유',
//   '홍',
//   '고',
//   '문',
//   '양',
//   '손',
//   '배',
//   '백',
//   '허',
//   '노',
//   '남',
//   '심',
// ]
//
// // 라인/공정 데이터 (25개 라인)
// const LINES = [
//   'MV L/R',
//   'MX5 LH',
//   'MX5 RH',
//   'MQ4 LH',
//   'MQ4 RH',
//   'AX/CV/SG2 LH',
//   'AX/CV/SG2 RH',
//   'SW L/R',
//   'LB L/R',
//   'NX4A L/R',
//   'NQ5 LH',
//   'NQ5 RH',
//   'C121 L/R',
//   'OV1K L/R',
//   'LQ2 L/R',
//   'JA/YB LH',
//   'JA/YB RH',
//   'SV/CT/NH2 LH',
//   'SV/CT/NH2 RH',
//   'ME L/R',
//   '프리미엄 A',
//   '프리미엄 B',
//   'CMS',
//   'ETCS',
//   '린지원',
// ]
//
// // 린지원 전용 프로세스
// const SUPPORT_PROCESSES = ['서열피더', '조립피더', '리워크', '폴리싱', '서열대차']
//
// // 100000 ~ 999999 범위 6자리 랜덤 사번
// function randomLoginId(): string {
//   const n = Math.floor(100000 + Math.random() * 900000)
//   return String(n)
// }
//
// // 중복 없는 loginId 리스트 생성
// function generateUniqueLoginIds(count: number, existing = new Set<string>()) {
//   const ids = new Set<string>()
//   while (ids.size < count) {
//     const id = randomLoginId()
//     if (!ids.has(id) && !existing.has(id)) ids.add(id)
//   }
//   return Array.from(ids)
// }
//
// async function seedUsers() {
//   const passwordHash = await bcrypt.hash(PASSWORD_PLAIN, 10)
//
//   // 관리자
//   const admins = ADMIN_NAMES.map((name, i) => ({
//     loginId: i === 0 ? 'admin' : `admin${i + 1}`,
//     password: passwordHash,
//     name,
//     role: Role.ADMIN,
//     isActive: true,
//   }))
//
//   // 관리자 아이디를 existing 세트에 넣어줌
//   const existing = new Set(admins.map((a) => a.loginId))
//
//   // 작업자
//   const workerLoginIds = generateUniqueLoginIds(TOTAL_WORKERS, existing)
//   const workers = Array.from({ length: TOTAL_WORKERS }, (_, idx) => {
//     const family = FAMILY_NAMES[idx % FAMILY_NAMES.length]
//     return {
//       loginId: workerLoginIds[idx],
//       password: passwordHash,
//       name: `${family}작업`,
//       role: Role.WORKER,
//       isActive: true,
//     }
//   })
//
//   await prisma.user.createMany({ data: admins, skipDuplicates: true })
//   await prisma.user.createMany({ data: workers, skipDuplicates: true })
//
//   console.log(`👑 Admins: ${admins.length}, 👷 Workers: ${workers.length}`)
//
//   return prisma.user.findMany()
// }
//
// async function seedLinesAndProcesses() {
//   for (let i = 0; i < LINES.length; i++) {
//     const lineName = LINES[i]
//
//     // 린지원 라인인지 확인
//     const processes =
//       lineName === '린지원'
//         ? SUPPORT_PROCESSES.map((name, idx) => ({ name, order: idx + 1 }))
//         : Array.from({ length: 7 }, (_, idx) => ({
//             name: `P${idx + 1}`,
//             order: idx + 1,
//           }))
//
//     await prisma.line.create({
//       data: {
//         name: lineName,
//         order: i + 1,
//         processes: { create: processes },
//       },
//     })
//   }
//
//   console.log(`📦 Lines + Processes seeded: ${LINES.length}`)
//
//   // 모든 라인과 프로세스 다시 조회해서 반환
//   return prisma.line.findMany({
//     include: { processes: true },
//   })
// }
//
// // 시프트 정의
// const SHIFT_RANGES = [
//   { type: ShiftType.DAY_NORMAL, start: 8, end: 17 },
//   { type: ShiftType.DAY_OVERTIME, start: 17, end: 20 },
//   { type: ShiftType.NIGHT_NORMAL, start: 20, end: 29 }, // 29시 = 다음날 05시
//   { type: ShiftType.NIGHT_OVERTIME, start: 29, end: 32 }, // 32시 = 다음날 08시
// ]
//
// // 중간 시간을 기준으로 ShiftType 계산
// function getShiftType(start: Date, end: Date): ShiftType {
//   const duration = differenceInMinutes(end, start)
//   if (duration <= 5) return ShiftType.UNKNOWN
//
//   const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2)
//   const midHour = mid.getHours() + mid.getDate() * 24
//
//   for (const range of SHIFT_RANGES) {
//     if (midHour >= range.start && midHour < range.end) {
//       return range.type
//     }
//   }
//
//   return ShiftType.UNKNOWN
// }
//
// async function seedWorkLogs(users: any[], lines: any[]) {
//   const workers = users.filter((u) => u.role === 'WORKER' && u.isActive)
//
//   for (let i = 0; i < 20; i++) {
//     const worker = workers[Math.floor(Math.random() * workers.length)]
//     const line = lines[Math.floor(Math.random() * lines.length)]
//     const process = line.processes[Math.floor(Math.random() * line.processes.length)]
//
//     // 랜덤 날짜 (최근 7일)
//     const baseDate = new Date()
//     baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 7))
//
//     // 랜덤 시작/종료 시간
//     const startHour = [7, 8, 16, 17, 19, 20, 4, 5][Math.floor(Math.random() * 8)]
//     const start = new Date(baseDate)
//     start.setHours(startHour, Math.floor(Math.random() * 60), 0, 0)
//
//     const end = addMinutes(start, 30 + Math.floor(Math.random() * 600)) // 30분 ~ 10시간
//
//     // ShiftType 판정
//     const shiftType = getShiftType(start, end)
//
//     await prisma.workLog.create({
//       data: {
//         userId: worker.id,
//         processId: process.id,
//         startedAt: start,
//         endedAt: end,
//         durationMinutes: differenceInMinutes(end, start),
//         shiftType,
//         isDefective: Math.random() < 0.1, // 10% 확률로 불량 처리
//         memo: null,
//         processName: process.name,
//         lineName: line.name,
//       },
//     })
//   }
//
//   console.log('📝 20 realistic WorkLogs seeded')
// }
//
// async function main() {
//   console.log('🚀 Seed 데이터 생성 시작...')
//   await prisma.workLog.deleteMany({})
//   await prisma.process.deleteMany({})
//   await prisma.line.deleteMany({})
//   await prisma.user.deleteMany({})
//
//   const users = await seedUsers()
//   const lines = await seedLinesAndProcesses()
//   await seedWorkLogs(users, lines)
//
//   console.log('✅ Seed complete')
// }
//
// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
