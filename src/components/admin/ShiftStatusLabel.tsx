import React from 'react'
import { WorkStatus } from '@prisma/client'
import { colorWorkStatus, displayWorkStatus } from '@/lib/utils/shift-status'

const ShiftStatusLabel = ({ status, size }: { status: WorkStatus; size: 'sm' | 'lg' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full ${size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'} font-medium ${colorWorkStatus(
        status,
      )}`}
    >
      {displayWorkStatus(status)}
    </span>
  )
}

export default ShiftStatusLabel