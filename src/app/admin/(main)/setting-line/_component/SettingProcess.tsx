'use client'

import React, { useState, useEffect } from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import useEditLock from '@/hooks/useEditLock'
import useLineDataSync from '@/hooks/useLineDataSync'
import { SessionUser } from '@/lib/core/session'
import ModalEditLock from '@/app/admin/(main)/setting-line/_component/ModalEditLock'
import { isEqual } from 'lodash'
import { updateLineWithProcess } from '@/lib/api/line-with-process-api'
import useEditLineWithProcess from '@/hooks/useEditLineWithProcess'
import LineTable from '@/app/admin/(main)/setting-line/_component/LineTable'
import LineRow from '@/app/admin/(main)/setting-line/_component/LineRow'
import { Progress } from '@/components/ui/progress'

export const leftTableHead = `min-w-[160px] min-h-[58px]`
export const leftTableShiftHead = `min-w-[160px] min-h-[100px]`

interface SettingProcessProps {
  initialData: LineResponseDto[]
  currentUser: SessionUser
}

/** 작업자 관리 */
const SettingProcess = ({ initialData, currentUser }: SettingProcessProps) => {
  const [lineWithProcess, setLineWithProcess] = useState<LineResponseDto[]>(initialData)
  const [tempLineWithProcess, setTempLineWithProcess] = useState<LineResponseDto[]>(lineWithProcess)
  const [saveProgress, setSaveProgress] = useState(0)

  // 라인 공정 편집 관련 hook
  const editLineControl = useEditLineWithProcess(
    lineWithProcess,
    setLineWithProcess,
    tempLineWithProcess,
    setTempLineWithProcess,
  )

  // 편집모드 Lock hook
  const { lockInfo, startEditing, stopEditing, isLoading } = useEditLock(currentUser)

  // 라인 데이터 실시간 동기화 hook
  useLineDataSync({
    isEditMode: lockInfo.isEditMode,
    onDataUpdate: setLineWithProcess,
    setSaveProgress,
  })

  // 편집 모드 변경 시 tempLineWithProcess 초기화
  useEffect(() => {
    if (lockInfo.isEditMode) {
      setTempLineWithProcess([...lineWithProcess])
    }
  }, [lockInfo.isEditMode, lineWithProcess])

  // 편집 취소
  const handleCancelEdit = () => {
    stopEditing().then()
    editLineControl.setEditingLine(null)
    editLineControl.setEditingProcess(null)
    editLineControl.setEditValue('')
  }

  // 자동 저장
  const handleAutoSaveEdit = async () => {
    if (isEqual(lineWithProcess, tempLineWithProcess)) {
      handleCancelEdit()
    } else {
      setSaveProgress(10)

      try {
        setSaveProgress(30)
        // API 호출
        const { data } = await updateLineWithProcess(tempLineWithProcess)
        setSaveProgress(70)
        console.log(data)
        setLineWithProcess(data)
        setTempLineWithProcess(data)
      } catch (error) {
        console.error('저장 실패:', error)
      } finally {
        setSaveProgress(100)
        setTimeout(() => {
          handleCancelEdit()
          setSaveProgress(0)
        }, 500)
      }
    }
  }

  // 드래그 앤 드롭 hook
  const dragAndDropControl = useDragAndDrop(tempLineWithProcess, setTempLineWithProcess)
  const workerDropControl = useDragAndDrop(lineWithProcess, setLineWithProcess, setSaveProgress)

  return (
    <div className="space-y-4">
      <div className="sticky top-28 md:top-16 z-56 left-0 right-0 w-full h-2">
        {saveProgress > 0 && <Progress value={saveProgress} className="h-2" />}
      </div>
      {/* 편집 모드 토글 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">작업장 관리</h3>
            <p className="text-sm text-gray-600 mt-2">
              {lockInfo.isEditMode
                ? '라인/공정 관리가 가능합니다'
                : '작업자 배치와 작업 상태 변경이 가능합니다.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-base font-medium ${lockInfo.isEditMode ? 'text-blue-600' : 'text-gray-600'}`}
            >
              편집모드
            </span>
            <button
              onClick={() => {
                if (!lockInfo.isEditMode) {
                  startEditing()
                } else {
                  handleAutoSaveEdit()
                }
              }}
              disabled={lockInfo.isLocked || isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                lockInfo.isLocked
                  ? 'bg-gray-300 cursor-not-allowed'
                  : lockInfo.isEditMode
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  lockInfo.isEditMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 테이블 */}
      <LineTable>
        <LineRow
          isEditMode={lockInfo.isEditMode}
          data={lockInfo.isEditMode ? tempLineWithProcess : lineWithProcess}
          setLineWithProcess={setLineWithProcess}
          dragAndDropControl={dragAndDropControl}
          workerDropControl={workerDropControl}
          editLineControl={editLineControl}
        />
      </LineTable>

      <ModalEditLock lockInfo={lockInfo} handleCancelEdit={handleCancelEdit} />
    </div>
  )
}

export default SettingProcess
