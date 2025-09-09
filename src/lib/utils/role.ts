import { Role } from '@prisma/client'

export const displayRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return '관리자'
    case Role.MANAGER:
      return '작업반장'
    case Role.WORKER:
      return '작업자'
  }
}

export const colorRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return 'bg-blue-100 text-blue-800 border border-blue-200'
    case Role.MANAGER:
      return 'bg-orange-100 text-orange-800 border border-orange-200'
    case Role.WORKER:
      return 'bg-green-100 text-green-800 border border-green-200'
  }
}
