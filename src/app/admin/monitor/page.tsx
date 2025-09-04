import React from 'react'

const initialLines: {
  id: string
  name: string
  order: number
  processes: { id: string; name: string; order: number }[]
}[] = [
  {
    id: '1',
    name: 'MV L/R',
    order: 1,
    processes: [
      { id: '1-1', name: 'P1', order: 1 },
      { id: '1-2', name: 'P2', order: 2 },
      { id: '1-3', name: 'P3', order: 3 },
      { id: '1-4', name: 'P4', order: 4 },
      { id: '1-5', name: 'P5', order: 5 },
      { id: '1-6', name: 'P6', order: 6 },
      { id: '1-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '2',
    name: 'MX5 LH',
    order: 2,
    processes: [
      { id: '2-1', name: 'P1', order: 1 },
      { id: '2-2', name: 'P2', order: 2 },
      { id: '2-3', name: 'P3', order: 3 },
      { id: '2-4', name: 'P4', order: 4 },
      { id: '2-5', name: 'P5', order: 5 },
      { id: '2-6', name: 'P6', order: 6 },
      { id: '2-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '3',
    name: 'MX5 RH',
    order: 3,
    processes: [
      { id: '3-1', name: 'P1', order: 1 },
      { id: '3-2', name: 'P2', order: 2 },
      { id: '3-3', name: 'P3', order: 3 },
      { id: '3-4', name: 'P4', order: 4 },
      { id: '3-5', name: 'P5', order: 5 },
      { id: '3-6', name: 'P6', order: 6 },
      { id: '3-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '4',
    name: 'MQ4 LH',
    order: 4,
    processes: [
      { id: '4-1', name: 'P1', order: 1 },
      { id: '4-2', name: 'P2', order: 2 },
      { id: '4-3', name: 'P3', order: 3 },
      { id: '4-4', name: 'P4', order: 4 },
      { id: '4-5', name: 'P5', order: 5 },
      { id: '4-6', name: 'P6', order: 6 },
      { id: '4-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '5',
    name: 'MQ4 RH',
    order: 5,
    processes: [
      { id: '5-1', name: 'P1', order: 1 },
      { id: '5-2', name: 'P2', order: 2 },
      { id: '5-3', name: 'P3', order: 3 },
      { id: '5-4', name: 'P4', order: 4 },
      { id: '5-5', name: 'P5', order: 5 },
      { id: '5-6', name: 'P6', order: 6 },
      { id: '5-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '6',
    name: 'AX/CV/SG2 LH',
    order: 6,
    processes: [
      { id: '6-1', name: 'P1', order: 1 },
      { id: '6-2', name: 'P2', order: 2 },
      { id: '6-3', name: 'P3', order: 3 },
      { id: '6-4', name: 'P4', order: 4 },
      { id: '6-5', name: 'P5', order: 5 },
      { id: '6-6', name: 'P6', order: 6 },
      { id: '6-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '7',
    name: 'AX/CV/SG2 RH',
    order: 7,
    processes: [
      { id: '7-1', name: 'P1', order: 1 },
      { id: '7-2', name: 'P2', order: 2 },
      { id: '7-3', name: 'P3', order: 3 },
      { id: '7-4', name: 'P4', order: 4 },
      { id: '7-5', name: 'P5', order: 5 },
      { id: '7-6', name: 'P6', order: 6 },
      { id: '7-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '8',
    name: 'SW L/R',
    order: 8,
    processes: [
      { id: '8-1', name: 'P1', order: 1 },
      { id: '8-2', name: 'P2', order: 2 },
      { id: '8-3', name: 'P3', order: 3 },
      { id: '8-4', name: 'P4', order: 4 },
      { id: '8-5', name: 'P5', order: 5 },
      { id: '8-6', name: 'P6', order: 6 },
      { id: '8-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '9',
    name: 'LB L/R',
    order: 9,
    processes: [
      { id: '9-1', name: 'P1', order: 1 },
      { id: '9-2', name: 'P2', order: 2 },
      { id: '9-3', name: 'P3', order: 3 },
      { id: '9-4', name: 'P4', order: 4 },
      { id: '9-5', name: 'P5', order: 5 },
      { id: '9-6', name: 'P6', order: 6 },
      { id: '9-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '10',
    name: 'NX4A L/R',
    order: 10,
    processes: [
      { id: '10-1', name: 'P1', order: 1 },
      { id: '10-2', name: 'P2', order: 2 },
      { id: '10-3', name: 'P3', order: 3 },
      { id: '10-4', name: 'P4', order: 4 },
      { id: '10-5', name: 'P5', order: 5 },
      { id: '10-6', name: 'P6', order: 6 },
      { id: '10-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '11',
    name: 'NQ5 LH',
    order: 11,
    processes: [
      { id: '11-1', name: 'P1', order: 1 },
      { id: '11-2', name: 'P2', order: 2 },
      { id: '11-3', name: 'P3', order: 3 },
      { id: '11-4', name: 'P4', order: 4 },
      { id: '11-5', name: 'P5', order: 5 },
      { id: '11-6', name: 'P6', order: 6 },
      { id: '11-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '12',
    name: 'NQ5 RH',
    order: 12,
    processes: [
      { id: '12-1', name: 'P1', order: 1 },
      { id: '12-2', name: 'P2', order: 2 },
      { id: '12-3', name: 'P3', order: 3 },
      { id: '12-4', name: 'P4', order: 4 },
      { id: '12-5', name: 'P5', order: 5 },
      { id: '12-6', name: 'P6', order: 6 },
      { id: '12-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '13',
    name: 'C121 L/R',
    order: 13,
    processes: [
      { id: '13-1', name: 'P1', order: 1 },
      { id: '13-2', name: 'P2', order: 2 },
      { id: '13-3', name: 'P3', order: 3 },
      { id: '13-4', name: 'P4', order: 4 },
      { id: '13-5', name: 'P5', order: 5 },
      { id: '13-6', name: 'P6', order: 6 },
      { id: '13-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '14',
    name: 'OV1K L/R',
    order: 14,
    processes: [
      { id: '14-1', name: 'P1', order: 1 },
      { id: '14-2', name: 'P2', order: 2 },
      { id: '14-3', name: 'P3', order: 3 },
      { id: '14-4', name: 'P4', order: 4 },
      { id: '14-5', name: 'P5', order: 5 },
      { id: '14-6', name: 'P6', order: 6 },
      { id: '14-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '15',
    name: 'LQ2 L/R',
    order: 15,
    processes: [
      { id: '15-1', name: 'P1', order: 1 },
      { id: '15-2', name: 'P2', order: 2 },
      { id: '15-3', name: 'P3', order: 3 },
      { id: '15-4', name: 'P4', order: 4 },
      { id: '15-5', name: 'P5', order: 5 },
      { id: '15-6', name: 'P6', order: 6 },
      { id: '15-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '16',
    name: 'JA/YB LH',
    order: 16,
    processes: [
      { id: '16-1', name: 'P1', order: 1 },
      { id: '16-2', name: 'P2', order: 2 },
      { id: '16-3', name: 'P3', order: 3 },
      { id: '16-4', name: 'P4', order: 4 },
      { id: '16-5', name: 'P5', order: 5 },
      { id: '16-6', name: 'P6', order: 6 },
      { id: '16-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '17',
    name: 'JA/YB RH',
    order: 17,
    processes: [
      { id: '17-1', name: 'P1', order: 1 },
      { id: '17-2', name: 'P2', order: 2 },
      { id: '17-3', name: 'P3', order: 3 },
      { id: '17-4', name: 'P4', order: 4 },
      { id: '17-5', name: 'P5', order: 5 },
      { id: '17-6', name: 'P6', order: 6 },
      { id: '17-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '18',
    name: 'SV/CT/NH2 LH',
    order: 18,
    processes: [
      { id: '18-1', name: 'P1', order: 1 },
      { id: '18-2', name: 'P2', order: 2 },
      { id: '18-3', name: 'P3', order: 3 },
      { id: '18-4', name: 'P4', order: 4 },
      { id: '18-5', name: 'P5', order: 5 },
      { id: '18-6', name: 'P6', order: 6 },
      { id: '18-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '19',
    name: 'SV/CT/NH2 RH',
    order: 19,
    processes: [
      { id: '19-1', name: 'P1', order: 1 },
      { id: '19-2', name: 'P2', order: 2 },
      { id: '19-3', name: 'P3', order: 3 },
      { id: '19-4', name: 'P4', order: 4 },
      { id: '19-5', name: 'P5', order: 5 },
      { id: '19-6', name: 'P6', order: 6 },
      { id: '19-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '20',
    name: 'ME L/R',
    order: 20,
    processes: [
      { id: '20-1', name: 'P1', order: 1 },
      { id: '20-2', name: 'P2', order: 2 },
      { id: '20-3', name: 'P3', order: 3 },
      { id: '20-4', name: 'P4', order: 4 },
      { id: '20-5', name: 'P5', order: 5 },
      { id: '20-6', name: 'P6', order: 6 },
      { id: '20-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '21',
    name: '프리미엄 A',
    order: 21,
    processes: [
      { id: '21-1', name: 'P1', order: 1 },
      { id: '21-2', name: 'P2', order: 2 },
      { id: '21-3', name: 'P3', order: 3 },
      { id: '21-4', name: 'P4', order: 4 },
      { id: '21-5', name: 'P5', order: 5 },
      { id: '21-6', name: 'P6', order: 6 },
      { id: '21-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '22',
    name: '프리미엄 B',
    order: 22,
    processes: [
      { id: '22-1', name: 'P1', order: 1 },
      { id: '22-2', name: 'P2', order: 2 },
      { id: '22-3', name: 'P3', order: 3 },
      { id: '22-4', name: 'P4', order: 4 },
      { id: '22-5', name: 'P5', order: 5 },
      { id: '22-6', name: 'P6', order: 6 },
      { id: '22-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '23',
    name: 'CMS',
    order: 23,
    processes: [
      { id: '23-1', name: 'P1', order: 1 },
      { id: '23-2', name: 'P2', order: 2 },
      { id: '23-3', name: 'P3', order: 3 },
      { id: '23-4', name: 'P4', order: 4 },
      { id: '23-5', name: 'P5', order: 5 },
      { id: '23-6', name: 'P6', order: 6 },
      { id: '23-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '24',
    name: 'ETCS',
    order: 24,
    processes: [
      { id: '24-1', name: 'P1', order: 1 },
      { id: '24-2', name: 'P2', order: 2 },
      { id: '24-3', name: 'P3', order: 3 },
      { id: '24-4', name: 'P4', order: 4 },
      { id: '24-5', name: 'P5', order: 5 },
      { id: '24-6', name: 'P6', order: 6 },
      { id: '24-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '25',
    name: '린지원',
    order: 25,
    processes: [
      { id: '25-1', name: '서열피더', order: 1 },
      { id: '25-2', name: '조립피더', order: 2 },
      { id: '25-3', name: '리워크', order: 3 },
      { id: '25-4', name: '폴리싱', order: 4 },
      { id: '25-5', name: '서열대차', order: 5 },
    ],
  },
]

const activeLogs = [
  {
    id: 'log-1',
    startedAt: new Date('2025-09-04T08:00:00'),
    endedAt: null,
    user: { id: 'u-1', name: '김철수', loginId: '2024001' },
    process: { id: '1-1', name: 'P1', lineId: '1' }, // MV L/R, P1
  },
  {
    id: 'log-2',
    startedAt: new Date('2025-09-04T08:10:00'),
    endedAt: null,
    user: { id: 'u-2', name: '이영희', loginId: '2024002' },
    process: { id: '1-3', name: 'P3', lineId: '1' }, // MV L/R, P3
  },
  {
    id: 'log-3',
    startedAt: new Date('2025-09-04T07:45:00'),
    endedAt: null,
    user: { id: 'u-3', name: '박민수', loginId: '2024003' },
    process: { id: '2-2', name: 'P2', lineId: '2' }, // MX5 LH, P2
  },
  {
    id: 'log-4',
    startedAt: new Date('2025-09-04T09:00:00'),
    endedAt: null,
    user: { id: 'u-4', name: '정수진', loginId: '2024004' },
    process: { id: '1-5', name: 'P5', lineId: '1' }, // MV L/R, P5
  },
  {
    id: 'log-5',
    startedAt: new Date('2025-09-04T10:15:00'),
    endedAt: null,
    user: { id: 'u-5', name: '홍길동', loginId: '2024005' },
    process: { id: '3-1', name: 'P1', lineId: '3' }, // MX5 RH, P1
  },
  {
    id: 'log-6',
    startedAt: new Date('2025-09-04T10:20:00'),
    endedAt: null,
    user: { id: 'u-6', name: '임도현', loginId: '2024006' },
    process: { id: '25-1', name: '서열피더', lineId: '25' }, // 린지원, 서열피더
  },
  {
    id: 'log-7',
    startedAt: new Date('2025-09-04T10:25:00'),
    endedAt: null,
    user: { id: 'u-7', name: '윤서영', loginId: '2024007' },
    process: { id: '25-2', name: '조립피더', lineId: '25' }, // 린지원, 조립피더
  },
]

const MonitorPage = () => {
  return (
    <div className="w-screen h-screen bg-white overflow-hidden">
      {initialLines.map((line) => (
        <div
          key={line.id}
          className="grid border-b"
          style={{
            gridTemplateColumns: `400px repeat(${line.processes.length + 1}, 1fr)`,
            height: `calc(100vh / ${initialLines.length})`,
          }}
        >
          {/* 라인명 */}
          <div className="flex items-center justify-center font-bold text-3xl bg-gray-100">
            {line.name}
          </div>

          {/* 공정 칸 */}
          {line.processes.map((proc) => {
            const log = activeLogs.find((l) => l.process.id === proc.id)

            return (
              <div
                key={proc.id}
                className="flex flex-row items-center justify-center border text-3xl gap-2"
              >
                <div className="flex-3/4 items-center justify-center">
                  <div className="flex gap-4">
                    <span className="font-semibold text-blue-600">{proc.name}</span>
                    {log ? (
                      <>
                        <span className="font-semibold">{log.user.name}</span>
                        <span className="text-gray-500">{log.user.loginId}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">
                        대기<span className="opacity-0">{'------------'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div className="flex items-center justify-center font-bold text-3xl border">잔업</div>
        </div>
      ))}
    </div>
  )
}

export default MonitorPage
