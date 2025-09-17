// seedLines.ts
import { PrismaClient, ShiftType } from '@prisma/client'

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
  for (const line of initialLines) {
    await prisma.line.create({
      data: {
        name: line.name,
        order: line.order,
        classNo: line.classNo,
        processes: {
          create: line.processes.map((p) => ({
            name: p.name,
            order: p.order,
            shifts: {
              create: [
                { type: ShiftType.DAY }, // 주간
                { type: ShiftType.NIGHT }, // 야간
              ],
            },
          })),
        },
      },
    })
  }

  console.log(
    `📦 Lines: ${initialLines.length}, Processes: ${initialLines.reduce(
      (acc, l) => acc + l.processes.length,
      0,
    )}, Shifts: ${initialLines.reduce((acc, l) => acc + l.processes.length * 2, 0)}`,
  )
}
