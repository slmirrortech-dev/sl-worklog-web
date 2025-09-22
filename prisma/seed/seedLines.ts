// seedLines.ts
import { PrismaClient, ShiftType, WorkStatus } from '@prisma/client'

const prisma = new PrismaClient()

const initialLines = [
  {
    name: 'MV L/R',
    order: 1,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'MX5 LH',
    order: 2,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'MX5 RH',
    order: 3,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'MQ4 LH',
    order: 4,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'MQ4 RH',
    order: 5,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'AX/CV/SG2 LH',
    order: 6,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'AX/CV/SG2 RH',
    order: 7,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'SW L/R',
    order: 8,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'LB L/R',
    order: 9,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'NX4A L/R',
    order: 10,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  // 없음
  {
    name: 'NQ5 LH',
    order: 11,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  // 없음
  {
    name: 'NQ5 RH',
    order: 12,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },

  {
    name: 'C121 L/R',
    order: 13,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'OV1K L/R',
    order: 14,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'LQ2 L/R',
    order: 15,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'JA/YB LH',
    order: 16,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'JA/YB RH',
    order: 17,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'SV/CT/NH2 LH',
    order: 18,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'SV/CT/NH2 RH',
    order: 19,
    classNo: 2,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'ME L/R',
    order: 20,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: '프리미엄 A',
    order: 21,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: '프리미엄 B',
    order: 22,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'CMS',
    order: 23,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: 'ETCS',
    order: 24,
    classNo: 1,
    processes: [
      { name: 'P1', order: 1 },
      { name: 'P2', order: 2 },
      { name: 'P3', order: 3 },
      { name: 'P4', order: 4 },
      { name: 'P5', order: 5 },
      { name: 'P6', order: 6 },
    ],
  },
  {
    name: '린지원',
    order: 25,
    classNo: 1,
    processes: [
      { name: '서열피더', order: 1 },
      { name: '조립피더', order: 2 },
      { name: '리워크', order: 3 },
      { name: '폴리싱', order: 4 },
      { name: '서열대차', order: 5 },
    ],
  },
  {
    name: '린지원',
    order: 26,
    classNo: 2,
    processes: [
      { name: '서열피더', order: 1 },
      { name: '조립피더', order: 2 },
      { name: '리워크', order: 3 },
      { name: '폴리싱', order: 4 },
      { name: '서열대차', order: 5 },
    ],
  },
]

export async function seedLines() {
  console.log(`📋 Creating ${initialLines.length} lines...`)

  // 작은 배치로 나누어 처리
  const batchSize = 5

  for (let batchStart = 0; batchStart < initialLines.length; batchStart += batchSize) {
    const batch = initialLines.slice(batchStart, batchStart + batchSize)
    console.log(`📦 Processing batch ${Math.floor(batchStart/batchSize) + 1}/${Math.ceil(initialLines.length/batchSize)}`)

    for (let i = 0; i < batch.length; i++) {
      const line = batch[i]
      const globalIndex = batchStart + i + 1
      console.log(`📋 Creating line ${globalIndex}/${initialLines.length}: ${line.name}`)

      try {
        // 라인 생성
        const createdLine = await prisma.line.create({
          data: {
            name: line.name,
            order: line.order,
            classNo: line.classNo,
          },
        })

        // 프로세스를 하나씩 생성
        for (let j = 0; j < line.processes.length; j++) {
          const process = line.processes[j]

          const createdProcess = await prisma.process.create({
            data: {
              name: process.name,
              order: process.order,
              lineId: createdLine.id,
            },
          })

          // 시프트를 별도로 생성
          await prisma.processShift.create({
            data: {
              processId: createdProcess.id,
              type: ShiftType.DAY,
              status: WorkStatus.NORMAL
            }
          })

          await prisma.processShift.create({
            data: {
              processId: createdProcess.id,
              type: ShiftType.NIGHT,
              status: WorkStatus.NORMAL
            }
          })

          // 작은 지연 추가
          await new Promise(resolve => setTimeout(resolve, 10))
        }

        console.log(`✅ Line ${line.name} created successfully`)

        // 배치 간 지연
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`❌ Error creating line ${line.name}:`, error)
        throw error
      }
    }
  }

  console.log(
    `📦 Lines: ${initialLines.length}, Processes: ${initialLines.reduce(
      (acc, l) => acc + l.processes.length,
      0,
    )}, Shifts: ${initialLines.reduce((acc, l) => acc + l.processes.length * 2, 0)}`,
  )
}
