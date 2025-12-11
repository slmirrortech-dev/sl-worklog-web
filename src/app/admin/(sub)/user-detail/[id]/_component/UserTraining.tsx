'use client'

import React, { useState } from 'react'
import { GraduationCap, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  createTrainingLogApi,
  getTrainingLogsByWorkerApi,
  removeTrainingLogApi,
} from '@/lib/api/training-log-api'
import { TrainingLogCreateRequest } from '@/types/training-log'
import { format } from 'date-fns'
import { useLoading } from '@/contexts/LoadingContext'
import { CustomDatePicker } from '@/components/CustomDatePicker'

const UserTraining = ({ userId }: { userId: string }) => {
  const { showLoading, hideLoading } = useLoading()

  const [isAdding, setIsAdding] = useState(false)

  // 입력 폼 상태
  const [newDate, setNewDate] = useState<Date | null>(new Date())
  const [newTrainingName, setNewTrainingName] = useState('')
  const [newInstructor, setNewInstructor] = useState('')

  const {
    data: trainingData,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['getTrainingLogsByWorkerApi', userId],
    queryFn: () => getTrainingLogsByWorkerApi(userId),
    select: (response) => {
      return response.data || []
    },
  })

  const { mutate: removeMutate } = useMutation({
    mutationFn: removeTrainingLogApi,
    onMutate: () => {
      showLoading()
    },
    onError: () => {
      alert('교육 이력 삭제 실패')
    },
    onSuccess: () => {
      refetch()
    },
    onSettled: () => {
      hideLoading()
    },
  })

  const { mutate: addMutate } = useMutation({
    mutationFn: createTrainingLogApi,
    onMutate: () => {
      showLoading()
    },
    onError: () => {
      alert('교육 이력 추가 실패')
    },
    onSuccess: () => {
      refetch()
      // 폼 초기화
      setNewDate(new Date())
      setNewTrainingName('')
      setNewInstructor('')
      setIsAdding(false)
    },
    onSettled: () => {
      hideLoading()
    },
  })

  const handleAdd = () => {
    if (!newDate || !newTrainingName || !newInstructor) {
      alert('모든 항목을 입력해주세요')
      return
    }

    const newRecord: TrainingLogCreateRequest = {
      trainedAt: format(newDate, "yyyy-MM-dd'T'HH:mm:ss"),
      workerId: userId,
      title: newTrainingName,
      instructor: newInstructor,
    }

    // api 호출
    addMutate(newRecord)
  }

  const handleDelete = (id: string) => {
    if (confirm('이 교육 이력을 삭제하시겠습니까?')) {
      removeMutate(id)
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
                  <CustomDatePicker
                    date={newDate}
                    onChangeAction={(e) => setNewDate(e)}
                    className="w-full !text-base h-10"
                    max={new Date()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교육명 *</label>
                  <Input
                    type="text"
                    value={newTrainingName}
                    onChange={(e) => setNewTrainingName(e.target.value)}
                    placeholder="예: 안전 교육"
                    className="w-full !text-base h-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">교육자 *</label>
                  <Input
                    type="text"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    placeholder="예: 김안전"
                    className="w-full !text-base h-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false)
                    setNewDate(new Date())
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

        {isPending && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {trainingData && trainingData.length === 0 && (
          <div className="text-center py-12 text-gray-400">등록된 교육 이력이 없습니다</div>
        )}

        {trainingData && trainingData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-32 min-w-[128px]">
                    교육일
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 min-w-[200px]">
                    교육명
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24 min-w-[96px]">
                    교육자
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-16 min-w-[64px]">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trainingData?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-base text-gray-900 text-center whitespace-nowrap">
                      {format(new Date(item.trainedAt), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-4 py-4 text-base font-medium text-gray-900 text-center whitespace-nowrap">
                      {item.title}
                    </td>
                    <td className="px-4 py-4 text-base text-gray-600 text-center whitespace-nowrap">
                      {item.instructor}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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
