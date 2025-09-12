'use client'

import React, { useEffect, useState } from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import { GripVertical, Plus, X, RotateCcw } from 'lucide-react'
import ContainerWaitingWorker from '@/app/admin/(main)/setting-line/_component/ContainerWaitingWorker'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'
import { ShiftType, WorkStatus } from '@prisma/client'
import { deleteWaitingWorKerApi } from '@/lib/api/wating-worker-api'
import { ApiResponse } from '@/types/common'

export const leftTableHead = `min-w-[160px] min-h-[58px]`
export const leftTableShiftHead = `min-w-[160px] min-h-[100px]`

const SettingProcess = ({ initialData }: { initialData: LineResponseDto[] }) => {
  const [lineWithProcess, setLineWithProcess] = useState<LineResponseDto[]>(initialData)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingLine, setEditingLine] = useState<string | null>(null)
  const [editingProcess, setEditingProcess] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingShift, setEditingShift] = useState<{
    lineId: string
    shiftType: 'DAY' | 'NIGHT'
  } | null>(null)

  const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd, isDragging } =
    useDragAndDrop(lineWithProcess, setLineWithProcess)

  useEffect(() => {
    console.log(lineWithProcess)
  }, [lineWithProcess])

  // 대기중인 작업자 삭제
  const handleRemoveWaitingWorker = async (process: any, shiftType: ShiftType) => {
    try {
      const {
        data,
      }: ApiResponse<{
        deleted: any
        updated: LineResponseDto[]
      }> = await deleteWaitingWorKerApi(process.id, shiftType)
      setLineWithProcess(data.updated)
    } catch (error) {
      alert('선택한 작업자 대기열에서 삭제 오류')
    }
  }

  // 초기화 함수
  const handleReset = () => {
    if (window.confirm('모든 변경사항이 초기 상태로 되돌아갑니다. 계속하시겠습니까?')) {
      setLineWithProcess(initialData)
      setEditingLine(null)
      setEditingProcess(null)
      setEditValue('')
      setEditingShift(null)
    }
  }

  // 라인 추가 함수
  const handleAddLine = () => {
    const newLine: LineResponseDto = {
      id: `temp-line-${Date.now()}`,
      name: `새 라인 ${lineWithProcess.length + 1}`,
      order: lineWithProcess.length + 1,
      dayStatus: 'NORMAL',
      nightStatus: 'NORMAL',
      processes: [],
    }
    setLineWithProcess([...lineWithProcess, newLine])
  }

  // 공정 추가 함수
  const handleAddProcess = (lineId: string) => {
    const updatedLines = lineWithProcess.map((line) => {
      if (line.id === lineId) {
        const newProcess = {
          id: `temp-process-${Date.now()}`,
          name: `P${line.processes.length + 1}`,
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
    setLineWithProcess(updatedLines)
  }

  // 라인 이름 편집 시작
  const handleStartEditLine = (lineId: string, currentName: string) => {
    if (!isEditMode) return
    setEditingLine(lineId)
    setEditValue(currentName)
  }

  // 공정 이름 편집 시작
  const handleStartEditProcess = (processId: string, currentName: string) => {
    if (!isEditMode) return
    setEditingProcess(processId)
    setEditValue(currentName)
  }

  // 라인 이름 저장
  const handleSaveLineEdit = () => {
    if (!editingLine) return
    const newName = editValue.trim() || '새 라인'
    const updatedLines = lineWithProcess.map((line) =>
      line.id === editingLine ? { ...line, name: newName } : line,
    )
    setLineWithProcess(updatedLines)
    setEditingLine(null)
    setEditValue('')
  }

  // 공정 이름 저장
  const handleSaveProcessEdit = () => {
    if (!editingProcess) return
    const newName = editValue.trim() || 'P1'
    const updatedLines = lineWithProcess.map((line) => ({
      ...line,
      processes: line.processes.map((process) =>
        process.id === editingProcess ? { ...process, name: newName } : process,
      ),
    }))
    setLineWithProcess(updatedLines)
    setEditingProcess(null)
    setEditValue('')
  }

  // 편집 취소
  const handleCancelEdit = () => {
    setEditingLine(null)
    setEditingProcess(null)
    setEditValue('')
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingLine) handleSaveLineEdit()
      if (editingProcess) handleSaveProcessEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
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
    const filteredLines = lineWithProcess.filter((line) => line.id !== lineId)
    setLineWithProcess(filteredLines)
  }

  // 공정 삭제 함수
  const handleDeleteProcess = (lineId: string, processId: string) => {
    const updatedLines = lineWithProcess.map((line) => {
      if (line.id === lineId) {
        return {
          ...line,
          processes: line.processes.filter((process) => process.id !== processId),
        }
      }
      return line
    })
    setLineWithProcess(updatedLines)
  }

  return (
    <div className="space-y-4">
      {/* 편집 모드 토글 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">작업장 관리</h3>
            <p className="text-sm text-gray-600 mt-2">
              {isEditMode
                ? '편집 모드 : 라인/공정 관리가 가능합니다'
                : '보기 모드 : 작업자 배치와 작업 상태 변경이 가능합니다.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="초기 상태로 되돌리기"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            )}
            <span
              className={`text-sm font-medium ${isEditMode ? 'text-blue-600' : 'text-gray-600'}`}
            >
              편집 모드
            </span>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isEditMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEditMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 테이블 */}
      <div
        className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${
          isEditMode ? 'border-blue-200 ring-4 ring-blue-100' : 'border-gray-200'
        } ${isDragging ? 'ring-2 ring-gray-300 shadow-md' : 'hover:shadow-md'}`}
      >
        <div className="overflow-auto">
          {/* 테이블 */}
          <table className="w-full border-collapse">
            {/* 테이블 해더 */}
            {/*<thead>*/}
            {/*  <tr>*/}
            {/*    <th className="w-40 border-b border-gray-200 px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-700 sticky left-0 top-0 z-20">*/}
            {/*      라인/공정*/}
            {/*    </th>*/}
            {/*    <th className="border-b border-gray-200 px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-700 sticky top-0 z-10"></th>*/}
            {/*  </tr>*/}
            {/*</thead>*/}
            {/* 테이블 바디 */}
            <tbody>
              {lineWithProcess.map((line) => {
                return (
                  <React.Fragment key={line.id}>
                    <tr>
                      <td className="sticky left-0 z-10">
                        <div
                          className={`group flex items-center justify-between ${leftTableHead} px-4 ${isEditMode ? 'cursor-move' : ''} transition-all duration-300 ${
                            isDragging &&
                            dragState.draggedType === 'line' &&
                            dragState.draggedItem?.id === line.id
                              ? 'bg-blue-50 border-l-4 border-blue-400 opacity-70 scale-98'
                              : isDragging && dragState.draggedType === 'line'
                                ? 'bg-blue-50 border-l-4 border-blue-300 hover:bg-blue-100'
                                : 'bg-white border-l-4 border-blue-500 hover:bg-blue-50'
                          }`}
                          draggable={isEditMode}
                          onDragStart={
                            isEditMode ? (e) => handleDragStart(e, line, 'line') : undefined
                          }
                          onDrop={isEditMode ? (e) => handleDrop(e, line, 'line') : undefined}
                          onDragOver={isEditMode ? handleDragOver : undefined}
                        >
                          <div className="flex items-center gap-3">
                            {isEditMode && <GripVertical className="w-4 h-4 text-gray-400" />}
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
                                  isEditMode
                                    ? 'cursor-pointer hover:text-blue-600 hover:underline'
                                    : ''
                                }`}
                                onClick={() => handleStartEditLine(line.id, line.name)}
                              >
                                {line.name}
                              </span>
                            )}
                          </div>
                          {isEditMode && (
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
                              draggable={isEditMode}
                              onDragStart={
                                isEditMode
                                  ? (e) => handleDragStart(e, process, 'process', line.id)
                                  : undefined
                              }
                              onDrop={
                                isEditMode
                                  ? (e) => handleDrop(e, process, 'process', line.id)
                                  : undefined
                              }
                              onDragOver={isEditMode ? handleDragOver : undefined}
                            >
                              <div
                                className={`group px-3 py-2 rounded-lg border shadow-sm flex h-full items-center justify-between ${isEditMode ? 'cursor-move' : ''} transition-all duration-300 ${
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
                                {isEditMode && (
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
                                        isEditMode
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
                                {isEditMode && (
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
                        {isEditMode && (
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
                              removeWaitingWorker={handleRemoveWaitingWorker}
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
                              removeWaitingWorker={handleRemoveWaitingWorker}
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
              {isEditMode && (
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
    </div>
  )
}

export default SettingProcess
