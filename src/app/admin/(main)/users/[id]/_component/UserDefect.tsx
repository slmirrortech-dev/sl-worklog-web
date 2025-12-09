'use client'

import React, { useState } from 'react'
import { OctagonAlert, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 불량유출 이력 타입
interface DefectRecord {
  id: string
  date: string // yyyy-mm-dd
  time: string
  line: string
  shift: string
  process: string
  memo: string
}

// 목업 데이터
const mockDefectRecords: DefectRecord[] = [
  {
    id: '1',
    date: '2024-12-05',
    time: '10:00',
    line: 'MX5 LH',
    shift: '주간',
    process: 'P1',
    memo: '부품 누락',
  },
  {
    id: '2',
    date: '2024-11-28',
    time: '10:00',
    line: 'MX5 RH',
    shift: '야간',
    process: 'P2',
    memo: '외관 불량 (스크래치)',
  },
]

const UserDefect = () => {
  const [records, setRecords] = useState<DefectRecord[]>(mockDefectRecords)
  const [isAdding, setIsAdding] = useState(false)

  // 입력 폼 상태
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newLine, setNewLine] = useState('')
  const [newShift, setNewShift] = useState('')
  const [newProcess, setNewProcess] = useState('')
  const [newMemo, setNewMemo] = useState('')

  const handleAdd = () => {
    if (!newDate || !newLine || !newProcess || !newMemo) {
      alert('모든 항목을 입력해주세요')
      return
    }

    const newRecord: DefectRecord = {
      id: Date.now().toString(),
      date: newDate,
      time: newTime,
      line: newLine,
      shift: newShift,
      process: newProcess,
      memo: newMemo,
    }

    setRecords([newRecord, ...records])

    // 폼 초기화
    setNewDate('')
    setNewLine('')
    setNewProcess('')
    setNewMemo('')
    setIsAdding(false)

    alert('불량유출 이력이 등록되었습니다')
  }

  const handleDelete = (id: string) => {
    if (confirm('이 불량유출 이력을 삭제하시겠습니까?')) {
      setRecords(records.filter((record) => record.id !== id))
      alert('불량유출 이력이 삭제되었습니다')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <OctagonAlert className="w-5 h-5 mr-2 text-gray-600" />
            불량유출 이력
          </h2>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              불량유출 이력 추가
            </Button>
          )}
        </div>
      </div>

      <div>
        {/* 불량유출 이력 추가 폼 */}
        {isAdding && (
          <div className="p-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">새 불량유출 이력 등록</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">발생일 *</label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">발생시간 *</label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">라인 *</label>
                  <Input
                    type="text"
                    value={newLine}
                    onChange={(e) => setNewLine(e.target.value)}
                    placeholder="예: MX5 LH"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교대조 *</label>
                  <Input
                    type="text"
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value)}
                    placeholder="예: 주간"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">공정 *</label>
                  <Input
                    type="text"
                    value={newProcess}
                    onChange={(e) => setNewProcess(e.target.value)}
                    placeholder="예: P1"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">메모 *</label>
                  <Input
                    type="text"
                    value={newMemo}
                    onChange={(e) => setNewMemo(e.target.value)}
                    placeholder="예: 부품 누락"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setNewDate('')
                    setNewLine('')
                    setNewProcess('')
                    setNewMemo('')
                  }}
                >
                  취소
                </Button>
                <Button size="sm" onClick={handleAdd}>
                  등록
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 불량유출 이력 목록 */}
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">등록된 불량유출 이력이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-32" />
                <col className="w-22" />
                <col className="w-34" />
                <col className="w-20" />
                <col className="w-20" />
                <col />
                <col className="w-16" />
              </colgroup>
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    발생일
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    발생시간
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    라인
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    교대조
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    공정
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    메모
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-base text-gray-900 text-center">{record.date}</td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center">{record.time}</td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center">{record.line}</td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center">
                      {record.shift}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-900 text-center">
                      {record.process}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-600 text-center">{record.memo}</td>
                    <td className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDefect
