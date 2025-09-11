'use client'

import React, { useEffect, useState } from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import { GripVertical, Plus, X } from 'lucide-react'
import ContainerWaitingWorker from '@/app/admin/(main)/new_process/_component/ContainerWaitingWorker'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'
import ShiftStatusLabel from '@/components/admin/ShiftStatusLabel'

export const leftTableHead = `min-w-[160px] min-h-[58px]`
export const leftTableShiftHead = `min-w-[160px] min-h-[100px]`

const SettingProcess = ({ initialData }: { initialData: LineResponseDto[] }) => {
  const [lineWithProcess, setLineWithProcess] = useState<LineResponseDto[]>(initialData)

  const { dragState, handleDragStart, handleDragOver, handleDrop, isDragging } = useDragAndDrop(
    lineWithProcess,
    setLineWithProcess,
  )

  useEffect(() => {
    console.log(lineWithProcess)
  }, [lineWithProcess])

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${
        isDragging ? 'ring-2 ring-gray-300 shadow-md' : 'hover:shadow-md'
      }`}
    >
      <div className="overflow-auto max-h-screen">
        {/* 테이블 */}
        <table className="w-full border-collapse">
          {/* 테이블 해더 */}
          <thead>
            <tr>
              <th className="w-40 border-b border-gray-200 px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-700 sticky left-0 top-0 z-20">
                라인
              </th>
              <th className="border-b border-gray-200 px-6 py-4 bg-gray-50 text-sm font-semibold text-gray-700 sticky top-0 z-10">
                공정
              </th>
            </tr>
          </thead>
          {/* 테이블 바디 */}
          <tbody>
            {lineWithProcess.map((line) => {
              return (
                <React.Fragment key={line.id}>
                  <tr>
                    <td className="sticky left-0 z-10">
                      <div
                        className={`flex items-center gap-3 ${leftTableHead} px-4 cursor-move transition-all duration-300 ${
                          isDragging &&
                          dragState.draggedType === 'line' &&
                          dragState.draggedItem?.id === line.id
                            ? 'bg-blue-50 border-l-4 border-blue-400 opacity-70 scale-98'
                            : isDragging && dragState.draggedType === 'line'
                              ? 'bg-blue-50 border-l-4 border-blue-300 hover:bg-blue-100'
                              : 'bg-white border-l-4 border-blue-500 hover:bg-blue-50'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, line, 'line')}
                        onDrop={(e) => handleDrop(e, line, 'line')}
                        onDragOver={handleDragOver}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-800">{line.name}</span>
                      </div>
                    </td>
                    <td className="flex bg-white border-b border-gray-200">
                      {/* 라인의 하위 공정 목록 */}
                      {line.processes.map((process) => {
                        return (
                          <div
                            key={process.id}
                            className={`${leftTableHead} px-2 py-1`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, process, 'process', line.id)}
                            onDrop={(e) => handleDrop(e, process, 'process', line.id)}
                            onDragOver={handleDragOver}
                          >
                            <div
                              className={`px-3 py-2 rounded-lg border shadow-sm flex h-full items-center justify-center gap-2 cursor-move transition-all duration-300 ${
                                isDragging &&
                                dragState.draggedType === 'process' &&
                                dragState.draggedItem?.id === process.id
                                  ? 'bg-gray-100 border-gray-400 opacity-70 scale-95'
                                  : isDragging &&
                                      dragState.draggedType === 'process' &&
                                      dragState.draggedLineId === line.id
                                    ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md'
                              }`}
                            >
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 font-semibold text-sm">
                                {process.name}
                              </span>
                              <button
                                title="공정 삭제"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      <div className={`${leftTableHead} px-2 py-1`}>
                        <button className="group flex flex-col items-center justify-center gap-1 w-full h-full bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-gray-500 hover:text-gray-600 transition-all duration-200">
                          <Plus className="w-4 h-4" />
                          <span className="text-xs font-medium">공정 추가</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="sticky left-0 z-10">
                      <div
                        className={`flex items-center justify-between ${leftTableShiftHead} px-4 py-3 bg-gray-50`}
                      >
                        <span className="font-semibold text-base text-gray-700">주간</span>
                        <ShiftStatusLabel status={line.dayStatus} size="sm" />
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
                              handleDrop(e, { processId, shiftType }, 'worker', line.id, processId)
                            }
                            onDragOver={handleDragOver}
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
                        <ShiftStatusLabel status={line.nightStatus} size="sm" />
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
                              handleDrop(e, { processId, shiftType }, 'worker', line.id, processId)
                            }
                            onDragOver={handleDragOver}
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
            <tr>
              <td className="sticky left-0 z-10">
                <div className="flex justify-center items-center min-h-[58px] px-4 bg-gray-50">
                  <button className="group flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-gray-500 hover:text-gray-600 transition-all duration-200">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">라인 추가</span>
                  </button>
                </div>
              </td>
              <td className="bg-gray-50"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SettingProcess
