import React, { useState } from 'react'
import { leftTableShiftHead } from '@/app/admin/(main)/setting-line/_component/SettingProcess'
import { ShiftType, WorkStatus } from '@prisma/client'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { LineResponseDto } from '@/types/line-with-process'

const ShiftTypeCell = ({
  shiftType,
  line,
  lineWithProcess,
  setLineWithProcess,
}: {
  shiftType: ShiftType
  line: any
  lineWithProcess: LineResponseDto[]
  setLineWithProcess: any
}) => {
  const shiftTypeName = shiftType === 'DAY' ? '주간' : '야간'
  const bgColor = shiftType === 'DAY' ? 'bg-gray-50' : 'bg-gray-100'
  const value = shiftType === 'DAY' ? line.dayStatus : line.nightStatus

  const [editingShift, setEditingShift] = useState<{
    lineId: string
    shiftType: ShiftType
  } | null>(null)

  // 시프트 상태 변경
  const handleChangeShiftStatus = (
    lineId: string,
    shiftType: ShiftType,
    newStatus: 'NORMAL' | 'OVERTIME' | 'EXTENDED',
  ) => {
    const updatedLines = lineWithProcess.map((line) => {
      if (line.id === lineId) {
        if (shiftType === 'DAY') {
          return { ...line, dayStatus: newStatus }
        } else {
          return { ...line, nightStatus: newStatus }
        }
      }
      return line
    })
    setLineWithProcess(updatedLines)
    setEditingShift(null)
  }

  return (
    <td className="sticky left-0 z-10">
      <div
        className={`flex items-center justify-between ${leftTableShiftHead} px-4 py-3 ${bgColor}`}
      >
        <span className="font-semibold text-base text-gray-700">{shiftTypeName}</span>
        {editingShift?.lineId === line.id && editingShift?.shiftType === shiftType ? (
          <select
            value={value}
            onChange={(e) =>
              handleChangeShiftStatus(line.id, shiftType, e.target.value as WorkStatus)
            }
            onBlur={() => setEditingShift(null)}
            className="text-sm px-3 py-1 font-medium border border-blue-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          >
            <option value="NORMAL">정상</option>
            <option value="OVERTIME">잔업</option>
            <option value="EXTENDED">연장</option>
          </select>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => setEditingShift({ lineId: line.id, shiftType: shiftType })}
          >
            <ShiftStatusLabel status={value} size="sm" />
          </div>
        )}
      </div>
    </td>
  )
}

export default ShiftTypeCell
