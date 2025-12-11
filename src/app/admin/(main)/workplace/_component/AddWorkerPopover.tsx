'use client'

import React, { useState } from 'react'
import { PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import RoleLabel from '@/components/admin/RoleLabel'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUsersApi } from '@/lib/api/user-api'
import { addWorkerToSlotApi } from '@/lib/api/process-slot-api'
import { useLoading } from '@/contexts/LoadingContext'
import CustomConfirmDialog from '@/components/CustomConfirmDialog'

interface AddWorkerPopoverProps {
  lineId: string
  slotIndex: number
  shiftType: 'DAY' | 'NIGHT'
  onClose: () => void
}

export default function AddWorkerPopover({
  lineId,
  slotIndex,
  shiftType,
  onClose,
}: AddWorkerPopoverProps) {
  const [searchText, setSearchText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [reassignWorkerId, setReassignWorkerId] = useState<string | null>(null)
  const [conflictMessage, setConflictMessage] = useState('')
  const queryClient = useQueryClient()
  const { showLoading, hideLoading } = useLoading()

  // 사용자 검색
  const { data: usersData, isLoading: isSearching } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () =>
      getUsersApi({
        page: 1,
        pageSize: 100,
        search: searchQuery || undefined,
      }),
    enabled: searchQuery.length > 0,
    select: (response) => response.data.data,
  })

  // 작업자 추가
  const addWorkerMutation = useMutation({
    mutationFn: ({ workerId, force = false }: { workerId: string; force?: boolean }) =>
      addWorkerToSlotApi(lineId, shiftType, slotIndex, workerId, force),
    onMutate: () => {
      showLoading()
    },
    onSuccess: () => {
      // 라인 데이터 refetch
      queryClient.invalidateQueries({ queryKey: ['getAllFactoryLineApi'] })
      onClose()
    },
    onError: (error: Error & { status?: number }) => {
      if (error.status === 409) {
        // 중복 배치 에러 - 재배치 확인 다이얼로그 표시
        setConflictMessage(error.message)
        setIsReassignDialogOpen(true)
      } else {
        alert(`작업자 추가 실패: ${error.message}`)
      }
    },
    onSettled: () => {
      hideLoading()
    },
  })

  const handleSearch = () => {
    setSearchQuery(searchText)
  }

  const handleAddWorker = (workerId: string) => {
    setReassignWorkerId(workerId)
    addWorkerMutation.mutate({ workerId, force: false })
  }

  const handleConfirmReassign = () => {
    if (reassignWorkerId) {
      setIsReassignDialogOpen(false)
      addWorkerMutation.mutate({ workerId: reassignWorkerId, force: true })
    }
  }

  return (
    <>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <p className="text-base font-semibold">작업자를 선택하세요</p>

          {/* 검색 입력 */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="사번 또는 이름으로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="w-full h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button variant="outline" size="default" onClick={handleSearch} className="px-3 h-10">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* 작업자 목록 */}
          <div className="max-h-60 overflow-y-auto">
            <ul>
              {isSearching ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <p className="text-sm text-gray-500">검색 중...</p>
                </div>
              ) : usersData && usersData.length > 0 ? (
                usersData.map((worker) => (
                  <li key={worker.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => handleAddWorker(worker.id)}
                      disabled={addWorkerMutation.isPending}
                      className="flex justify-between items-center w-full flex-row gap-2 hover:bg-gray-100 px-2 py-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex flex-row gap-2 items-center">
                        <RoleLabel role={worker.role} size="sm" />
                        <span className="font-semibold">{worker.name}</span>
                        <span className="text-gray-500">({worker.userId})</span>
                      </div>
                      <Plus className="w-4 h-4" />
                    </button>
                  </li>
                ))
              ) : searchQuery ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <p className="text-sm text-gray-400">검색된 작업자가 없습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-12">
                  <p className="text-sm text-gray-400">사번 또는 이름으로 검색하세요</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </PopoverContent>

      <CustomConfirmDialog
        isOpen={isReassignDialogOpen}
        setIsOpen={setIsReassignDialogOpen}
        isLoading={addWorkerMutation.isPending}
        title="작업자 재배치"
        desc={`${conflictMessage}\n선택한 위치에 다시 배치하시겠습니까?`}
        btnCancel={{ btnText: '취소' }}
        btnConfirm={{ btnText: '재배치', fn: handleConfirmReassign }}
      />
    </>
  )
}
