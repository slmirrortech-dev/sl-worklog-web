import { WorkStatus, WorkerStatus } from '@prisma/client'

export const displayWorkStatus = (status: WorkStatus) => {
  switch (status) {
    case 'NORMAL':
      return '정상'
    case 'OVERTIME':
      return '잔업'
    case 'EXTENDED':
      return '연장'
  }
}

export const displayWorkerStatus = (status: WorkerStatus) => {
  switch (status) {
    case 'NORMAL':
      return '정상'
    case 'OVERTIME':
      return '잔업'
  }
}

export const colorWorkStatus = (status: WorkStatus) => {
  switch (status) {
    case 'NORMAL':
      return 'bg-green-100 text-green-800 border border-green-200'
    case 'OVERTIME':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    case 'EXTENDED':
      return 'bg-red-100 text-red-800 border border-red-200'
  }
}
