import React from 'react'
import { Role } from '@prisma/client'
import { colorRole, displayRole } from '@/lib/utils/role'

/** 역할 라벨 */
const RoleLabel = ({ role, size }: { role: Role; size: 'sm' | 'lg' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${size === 'sm' ? 'text-sm' : 'text-lg'} font-medium ${colorRole(
        role,
      )}`}
    >
      {displayRole(role)}
    </span>
  )
}

export default RoleLabel
