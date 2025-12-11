import React from 'react'
import { WorkStatus } from '@prisma/client'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { colorWorkStatus, displayWorkStatus } from '@/lib/utils/shift-status'
import { ChevronDown } from 'lucide-react'

interface ShiftStatusSelectProps {
  status: WorkStatus
  onStatusChange: (status: WorkStatus) => void
  disabled?: boolean
}

const ShiftStatusSelect = ({
  status,
  onStatusChange,
  disabled = false,
}: ShiftStatusSelectProps) => {
  const workStatusOptions: WorkStatus[] = ['NORMAL', 'OVERTIME', 'EXTENDED']

  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as WorkStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-fit h-8 border-none shadow-none p-0">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full text-base pl-2.5 pr-1 py-1.5 h-8 font-medium ${colorWorkStatus(status)}`}
        >
          {displayWorkStatus(status)}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </span>
      </SelectTrigger>
      <SelectContent>
        {workStatusOptions.map((option) => (
          <SelectItem key={option} value={option}>
            <span
              className={`inline-flex items-center rounded-full text-sm px-4 py-1 font-medium ${colorWorkStatus(option)}`}
            >
              {displayWorkStatus(option)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ShiftStatusSelect
