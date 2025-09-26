import React from 'react'
import { WorkStatus } from '@prisma/client'
import { colorWorkStatus, displayWorkStatus } from '@/lib/utils/shift-status'

const ShiftStatusLabel = ({ status, size }: { status: WorkStatus; size: 'sm' | 'lg' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full ${size === 'sm' ? 'text-sm px-3 h-6.5' : 'text-base px-4 py-1.5 h-8'} font-medium ${colorWorkStatus(
        status,
      )}`}
    >
      {displayWorkStatus(status)}
    </span>
  )
}

export default ShiftStatusLabel
