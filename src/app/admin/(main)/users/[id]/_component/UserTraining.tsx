'use client'

import React, { useState } from 'react'
import { GraduationCap, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 교육 이력 타입
interface TrainingRecord {
  id: string
  date: string // yyyy-mm-dd
  trainingName: string
  instructor: string
}

// 목업 데이터
const mockTrainingRecords: TrainingRecord[] = [
  {
    id: '1',
    date: '2024-12-01',
    trainingName: '안전 교육',
    instructor: '김안전',
  },
  {
    id: '2',
    date: '2024-11-15',
    trainingName: '품질 관리 교육',
    instructor: '이품질',
  },
  {
    id: '3',
    date: '2024-10-20',
    trainingName: '신규 공정 교육',
    instructor: '박공정',
  },
]

const UserTraining = () => {
  const [records, setRecords] = useState<TrainingRecord[]>(mockTrainingRecords)
  const [isAdding, setIsAdding] = useState(false)

  // 입력 폼 상태
  const [newDate, setNewDate] = useState('')
  const [newTrainingName, setNewTrainingName] = useState('')
  const [newInstructor, setNewInstructor] = useState('')

  const handleAdd = () => {
    if (!newDate || !newTrainingName || !newInstructor) {
      alert('모든 항목을 입력해주세요')
      return
    }

    const newRecord: TrainingRecord = {
      id: Date.now().toString(),
      date: newDate,
      trainingName: newTrainingName,
      instructor: newInstructor,
    }

    setRecords([newRecord, ...records])

    // 폼 초기화
    setNewDate('')
    setNewTrainingName('')
    setNewInstructor('')
    setIsAdding(false)

    alert('교육 이력이 등록되었습니다')
  }

  const handleDelete = (id: string) => {
    if (confirm('이 교육 이력을 삭제하시겠습니까?')) {
      setRecords(records.filter((record) => record.id !== id))
      alert('교육 이력이 삭제되었습니다')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
            교육 이력
          </h2>
          {!isAdding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              교육 이력 추가
            </Button>
          )}
        </div>
      </div>

      <div>
        {/* 교육 이력 추가 폼 */}
        {isAdding && (
          <div className="p-4">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">새 교육 이력 등록</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교육일 *</label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교육명 *</label>
                  <Input
                    type="text"
                    value={newTrainingName}
                    onChange={(e) => setNewTrainingName(e.target.value)}
                    placeholder="예: 안전 교육"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교육자 *</label>
                  <Input
                    type="text"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    placeholder="예: 김안전"
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
                    setNewTrainingName('')
                    setNewInstructor('')
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

        {/* 교육 이력 목록 */}
        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">등록된 교육 이력이 없습니다</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-32" />
                <col />
                <col className="w-32" />
                <col className="w-20" />
              </colgroup>
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    교육일
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    교육명
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    교육자
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
                    <td className="px-4 py-4 text-base font-medium text-gray-900 text-center">
                      {record.trainingName}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-600 text-center">
                      {record.instructor}
                    </td>
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

export default UserTraining
