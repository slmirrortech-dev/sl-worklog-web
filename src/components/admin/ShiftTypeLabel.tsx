import React from 'react'
import { ShiftType } from '@prisma/client'
import { colorShiftType, displayShiftType } from '@/lib/utils/shift-type'

const ShiftTypeLabel = ({ shiftType, size }: { shiftType: ShiftType; size: 'sm' | 'lg' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full ${size === 'sm' ? 'text-sm px-3 h-6.5' : 'text-base px-4 py-1.5'} font-medium ${colorShiftType(
        shiftType,
      )}`}
    >
      {displayShiftType(shiftType)}
    </span>
  )
}

export default ShiftTypeLabel
