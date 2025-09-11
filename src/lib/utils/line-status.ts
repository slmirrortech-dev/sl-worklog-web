import { WorkStatus, Process, ProcessShift } from '@prisma/client'

export function getShiftStatus(
  processes: (Process & { shifts: ProcessShift[] })[],
  type: 'DAY' | 'NIGHT',
): WorkStatus {
  const statuses = processes
    .map((p) => p.shifts.find((s) => s.type === type)?.status)
    .filter(Boolean) as WorkStatus[]

  if (statuses.includes('EXTENDED')) return 'EXTENDED'
  if (statuses.includes('OVERTIME')) return 'OVERTIME'
  return 'NORMAL'
}
