import { ShiftType } from '@prisma/client'

export const displayShiftType = (shiftType: ShiftType) => {
  switch (shiftType) {
    case 'DAY':
      return '주간'
    case 'NIGHT':
      return '야간'
  }
}

export const colorShiftType = (shiftType: ShiftType) => {
  switch (shiftType) {
    case 'DAY':
      return 'bg-orange-100 text-orange-800 border border-orange-200'
    case 'NIGHT':
      return 'bg-purple-100 text-purple-800 border border-purple-200'
  }
}
