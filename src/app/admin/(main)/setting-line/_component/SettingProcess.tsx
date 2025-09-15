'use client'

import React, { useState, useEffect } from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import { GripVertical, Plus, X } from 'lucide-react'
import ContainerWaitingWorker from '@/app/admin/(main)/setting-line/_component/ContainerWaitingWorker'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { WorkStatus } from '@prisma/client'
import useEditLock from '@/hooks/useEditLock'
import { SessionUser } from '@/lib/core/session'
import ModalEditLock from '@/app/admin/(main)/setting-line/_component/ModalEditLock'
import { isEqual } from 'lodash'
import { updateLineWithProcess } from '@/lib/api/line-with-process-api'
import { useRouter } from 'next/navigation'

export const leftTableHead = `min-w-[160px] min-h-[58px]`
export const leftTableShiftHead = `min-w-[160px] min-h-[100px]`

interface SettingProcessProps {
  initialData: LineResponseDto[]
  currentUser: SessionUser
}

/** 작업자 관리 */
const SettingProcess = ({ initialData, currentUser }: SettingProcessProps) => {
  const router = useRouter()
  const [lineWithProcess, setLineWithProcess] = useState<LineResponseDto[]>(initialData)
  const [tempLineWithProcess, setTempLineWithProcess] = useState<LineResponseDto[]>(lineWithProcess)
  const [editingLine, setEditingLine] = useState<string | null>(null)
  const [editingProcess, setEditingProcess] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingShift, setEditingShift] = useState<{
    lineId: string
    shiftType: 'DAY' | 'NIGHT'
  } | null>(null)

  // 편집모드 Lock hook
  const { lockInfo, startEditing, stopEditing, isLoading } = useEditLock(currentUser)

  // 편집 모드 변경 시 tempLineWithProcess 초기화
  useEffect(() => {
    if (lockInfo.isEditMode) {
      setTempLineWithProcess([...lineWithProcess])
    }
  }, [lockInfo.isEditMode, lineWithProcess])

  // 드래그 앤 드롭 hook
  const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd, isDragging } =
    useDragAndDrop(tempLineWithProcess, setTempLineWithProcess)

  // 라인 추가 함수
  const handleAddLine = () => {
    const newLine: LineResponseDto = {
      id: `temp-line-${Date.now()}`,
      name: `라인 이름`,
      order: tempLineWithProcess.length + 1,
      classNo: [1],
      dayStatus: 'NORMAL',
      nightStatus: 'NORMAL',
      processes: [],
    }
    setTempLineWithProcess([...tempLineWithProcess, newLine])
  }

  // 공정 추가 함수
  const handleAddProcess = (lineId: string) => {
    const updatedLines = tempLineWithProcess.map((line) => {
      if (line.id === lineId) {
        const newProcess = {
          id: `temp-process-${Date.now()}`,
          name: '공정 이름',
          order: line.processes.length + 1,
          lineId: lineId,
          shifts: [
            {
              id: `temp-shift-day-${Date.now()}`,
              type: 'DAY' as const,
              status: 'NORMAL' as const,
              processId: `temp-process-${Date.now()}`,
              waitingWorkerId: null,
              waitingWorker: null,
            },
            {
              id: `temp-shift-night-${Date.now()}`,
              type: 'NIGHT' as const,
              status: 'NORMAL' as const,
              processId: `temp-process-${Date.now()}`,
              waitingWorkerId: null,
              waitingWorker: null,
            },
          ],
        }
        return {
          ...line,
          processes: [...line.processes, newProcess],
        }
      }
      return line
    })
    setTempLineWithProcess(updatedLines)
  }

  // 라인 이름 편집 시작
  const handleStartEditLine = (lineId: string, currentName: string) => {
    if (!lockInfo.isEditMode) return
    setEditingLine(lineId)
    setEditValue(currentName)
  }

  // 공정 이름 편집 시작
  const handleStartEditProcess = (processId: string, currentName: string) => {
    if (!lockInfo.isEditMode) return
    setEditingProcess(processId)
    setEditValue(currentName)
  }

  // 라인 이름 저장
  const handleSaveLineEdit = () => {
    if (!editingLine) return
    const newName = editValue.trim() || '라인 이름'
    const updatedLines = lineWithProcess.map((line) =>
      line.id === editingLine ? { ...line, name: newName } : line,
    )
    setTempLineWithProcess(updatedLines)
    setEditingLine(null)
    setEditValue('')
  }

  // 공정 이름 저장
  const handleSaveProcessEdit = () => {
    if (!editingProcess) return
    const newName = editValue.trim() || '공정 이름'
    const updatedLines = lineWithProcess.map((line) => ({
      ...line,
      processes: line.processes.map((process) =>
        process.id === editingProcess ? { ...process, name: newName } : process,
      ),
    }))
    setTempLineWithProcess(updatedLines)
    setEditingProcess(null)
    setEditValue('')
  }

  // 편집 취소
  const handleCancelEdit = () => {
    stopEditing().then()
    setEditingLine(null)
    setEditingProcess(null)
    setEditValue('')
  }

  const handleAutoSaveEdit = async () => {
    if (isEqual(lineWithProcess, tempLineWithProcess)) {
      handleCancelEdit()
    } else {
      // API 호출
      const { data } = await updateLineWithProcess(tempLineWithProcess)
      console.log(data)
      setLineWithProcess(data)
      setTempLineWithProcess(data)
      router.refresh()
      handleCancelEdit()
    }
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingLine) handleSaveLineEdit()
      if (editingProcess) handleSaveProcessEdit()
    }
  }

  // 시프트 상태 변경
  const handleChangeShiftStatus = (
    lineId: string,
    shiftType: 'DAY' | 'NIGHT',
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

  // 라인 삭제 함수
  const handleDeleteLine = (lineId: string) => {
    const filteredLines = tempLineWithProcess.filter((line) => line.id !== lineId)
    setTempLineWithProcess(filteredLines)
  }

  // 공정 삭제 함수
  const handleDeleteProcess = (lineId: string, processId: string) => {
    const updatedLines = tempLineWithProcess.map((line) => {
      if (line.id === lineId) {
        return {
          ...line,
          processes: line.processes.filter((process) => process.id !== processId),
        }
      }
      return line
    })
    setTempLineWithProcess(updatedLines)
  }

  return (
    <div className="space-y-4">
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
                  // handleCancelEdit()
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
      <div
        className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${
          lockInfo.isEditMode ? 'border-blue-200 ring-4 ring-blue-100' : 'border-gray-200'
        } ${isDragging ? 'ring-2 ring-gray-300 shadow-md' : 'hover:shadow-md'}`}
      >
        <div className="overflow-auto">
          {/* 테이블 */}
          <table className="w-full border-collapse">
            <tbody>
              {(lockInfo.isEditMode ? tempLineWithProcess : lineWithProcess).map((line) => {
                return (
                  <React.Fragment key={line.id}>
                    <tr>
                      <td className="sticky left-0 z-10">
                        <div
                          className={`group flex items-center justify-between ${leftTableHead} px-4 ${lockInfo.isEditMode ? 'cursor-move' : ''} transition-all duration-300 ${
                            isDragging &&
                            dragState.draggedType === 'line' &&
                            dragState.draggedItem?.id === line.id
                              ? 'bg-blue-50 border-l-4 border-blue-400 opacity-70 scale-98'
                              : isDragging && dragState.draggedType === 'line'
                                ? 'bg-blue-50 border-l-4 border-blue-300 hover:bg-blue-100'
                                : 'bg-white border-l-4 border-blue-500 hover:bg-blue-50'
                          }`}
                          draggable={lockInfo.isEditMode}
                          onDragStart={
                            lockInfo.isEditMode
                              ? (e) => handleDragStart(e, line, 'line')
                              : undefined
                          }
                          onDrop={
                            lockInfo.isEditMode ? (e) => handleDrop(e, line, 'line') : undefined
                          }
                          onDragOver={lockInfo.isEditMode ? handleDragOver : undefined}
                        >
                          <div className="flex items-center gap-3">
                            {lockInfo.isEditMode && (
                              <GripVertical className="w-4 h-4 text-gray-400" />
                            )}
                            {editingLine === line.id ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveLineEdit}
                                className="text-lg font-semibold text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[120px]"
                                autoFocus
                              />
                            ) : (
                              <span
                                className={`text-lg font-semibold text-gray-800 ${
                                  lockInfo.isEditMode
                                    ? 'cursor-pointer hover:text-blue-600 hover:underline'
                                    : ''
                                }`}
                                onClick={() => handleStartEditLine(line.id, line.name)}
                              >
                                {line.name}
                              </span>
                            )}
                          </div>
                          {lockInfo.isEditMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteLine(line.id)
                              }}
                              title="라인 삭제"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="flex bg-white">
                        {/* 라인의 하위 공정 목록 */}
                        {line.processes.map((process) => {
                          return (
                            <div
                              key={process.id}
                              className={`${leftTableHead} px-2 py-1`}
                              draggable={lockInfo.isEditMode}
                              onDragStart={
                                lockInfo.isEditMode
                                  ? (e) => handleDragStart(e, process, 'process', line.id)
                                  : undefined
                              }
                              onDrop={
                                lockInfo.isEditMode
                                  ? (e) => handleDrop(e, process, 'process', line.id)
                                  : undefined
                              }
                              onDragOver={lockInfo.isEditMode ? handleDragOver : undefined}
                            >
                              <div
                                className={`group px-3 py-2 rounded-lg border shadow-sm flex h-full items-center justify-between ${lockInfo.isEditMode ? 'cursor-move' : ''} transition-all duration-300 ${
                                  isDragging &&
                                  dragState.draggedType === 'process' &&
                                  dragState.draggedItem?.id === process.id
                                    ? 'bg-blue-200 border-blue-400 opacity-70 scale-95'
                                    : isDragging &&
                                        dragState.draggedType === 'process' &&
                                        dragState.draggedLineId === line.id
                                      ? 'bg-blue-100 border-blue-300 hover:bg-blue-200'
                                      : 'bg-blue-500 border-blue-600 hover:bg-blue-600 hover:shadow-md text-white'
                                }`}
                              >
                                {lockInfo.isEditMode && (
                                  <GripVertical className="w-4 h-4 text-white flex-shrink-0" />
                                )}
                                <div className="flex-1 flex justify-center">
                                  {editingProcess === process.id ? (
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={handleKeyDown}
                                      onBlur={handleSaveProcessEdit}
                                      className="text-gray-700 font-semibold text-sm bg-white border border-blue-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-16 text-center"
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className={`text-white font-semibold text-sm ${
                                        lockInfo.isEditMode
                                          ? 'cursor-pointer hover:text-blue-100 hover:underline'
                                          : ''
                                      }`}
                                      onClick={() =>
                                        handleStartEditProcess(process.id, process.name)
                                      }
                                    >
                                      {process.name}
                                    </span>
                                  )}
                                </div>
                                {lockInfo.isEditMode && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteProcess(line.id, process.id)
                                    }}
                                    title="공정 삭제"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-300 hover:bg-red-500/20 rounded-full p-1 flex-shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                        {lockInfo.isEditMode && (
                          <div className={`${leftTableHead} px-2 py-1`}>
                            <button
                              onClick={() => handleAddProcess(line.id)}
                              className="group flex items-center justify-center gap-2 w-full h-full bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-gray-500 hover:text-gray-600 transition-all duration-200"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm font-medium">공정 추가</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="sticky left-0 z-10">
                        <div
                          className={`flex items-center justify-between ${leftTableShiftHead} px-4 py-3 bg-gray-50`}
                        >
                          <span className="font-semibold text-base text-gray-700">주간</span>
                          {editingShift?.lineId === line.id && editingShift?.shiftType === 'DAY' ? (
                            <select
                              value={line.dayStatus}
                              onChange={(e) =>
                                handleChangeShiftStatus(
                                  line.id,
                                  'DAY',
                                  e.target.value as WorkStatus,
                                )
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
                              onClick={() => setEditingShift({ lineId: line.id, shiftType: 'DAY' })}
                            >
                              <ShiftStatusLabel status={line.dayStatus} size="sm" />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* 주간 공정 작업자 리스트 */}
                      <td className="flex bg-gray-50">
                        {line.processes.map((process) => {
                          return (
                            <ContainerWaitingWorker
                              key={process.id}
                              process={process}
                              shiftType="DAY"
                              setLineWithProcess={setLineWithProcess}
                              onDragStart={(e, processId, shiftType) =>
                                handleDragStart(
                                  e,
                                  { processId, shiftType },
                                  'worker',
                                  line.id,
                                  processId,
                                )
                              }
                              onDrop={(e, processId, shiftType) =>
                                handleDrop(
                                  e,
                                  { processId, shiftType },
                                  'worker',
                                  line.id,
                                  processId,
                                )
                              }
                              onDragOver={handleDragOver}
                              onDragEnd={handleDragEnd}
                              isDragging={isDragging}
                              dragState={dragState}
                            />
                          )
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="sticky left-0 z-10">
                        <div
                          className={`flex items-center justify-between ${leftTableShiftHead} px-4 py-3 bg-gray-100`}
                        >
                          <span className="font-semibold text-base text-gray-700">야간</span>
                          {editingShift?.lineId === line.id &&
                          editingShift?.shiftType === 'NIGHT' ? (
                            <select
                              value={line.nightStatus}
                              onChange={(e) =>
                                handleChangeShiftStatus(
                                  line.id,
                                  'NIGHT',
                                  e.target.value as WorkStatus,
                                )
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
                              onClick={() =>
                                setEditingShift({ lineId: line.id, shiftType: 'NIGHT' })
                              }
                            >
                              <ShiftStatusLabel status={line.nightStatus} size="sm" />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* 야간 공정 작업자 리스트 */}
                      <td className="flex bg-gray-100">
                        {line.processes.map((process) => {
                          return (
                            <ContainerWaitingWorker
                              key={process.id}
                              process={process}
                              shiftType="NIGHT"
                              setLineWithProcess={setLineWithProcess}
                              onDragStart={(e, processId, shiftType) =>
                                handleDragStart(
                                  e,
                                  { processId, shiftType },
                                  'worker',
                                  line.id,
                                  processId,
                                )
                              }
                              onDrop={(e, processId, shiftType) =>
                                handleDrop(
                                  e,
                                  { processId, shiftType },
                                  'worker',
                                  line.id,
                                  processId,
                                )
                              }
                              onDragOver={handleDragOver}
                              onDragEnd={handleDragEnd}
                              isDragging={isDragging}
                              dragState={dragState}
                            />
                          )
                        })}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
              {lockInfo.isEditMode && (
                <tr>
                  <td className="sticky left-0 z-10">
                    <div className="flex justify-center items-center min-h-[58px] pl-2 bg-gray-50">
                      <button
                        onClick={handleAddLine}
                        className="w-full group flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-gray-500 hover:text-gray-600 transition-all duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">라인 추가</span>
                      </button>
                    </div>
                  </td>
                  <td className="bg-gray-50"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ModalEditLock lockInfo={lockInfo} handleCancelEdit={handleCancelEdit} />
    </div>
  )
}

export default SettingProcess
