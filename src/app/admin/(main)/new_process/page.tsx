'use client'

import React, { useState } from 'react'
import { Plus, GripVertical, Trash2 } from 'lucide-react'

interface Process {
  id: string
  name: string
}

interface Line {
  id: string
  name: string
  processes: Process[]
}

const NewProcessPage = () => {
  const [lines, setLines] = useState<Line[]>([
    {
      id: 'la',
      name: 'MV L/R',
      processes: [
        { id: 'la-p1', name: 'P1' },
        { id: 'la-p2', name: 'P2' },
        { id: 'la-p3', name: 'P3' },
        { id: 'la-p10', name: 'P10' },
        { id: 'la-p4', name: 'P4' },
        { id: 'la-p5', name: 'P5' },
        { id: 'la-p6', name: 'P6' },
        { id: 'la-p7', name: 'P7' },
        { id: 'la-p8', name: 'P8' },
        { id: 'la-p9', name: 'P9' },
      ],
    },
    {
      id: 'lb',
      name: 'MX5 LH',
      processes: [
        { id: 'lb-p1', name: 'P1' },
        { id: 'lb-p2', name: 'P2' },
        { id: 'lb-p3', name: 'P3' },
        { id: 'lb-p4', name: 'P4' },
        { id: 'lb-p5', name: 'P5' },
        { id: 'lb-p6', name: 'P6' },
      ],
    },
    {
      id: 'lc',
      name: 'MX5 RH',
      processes: [
        { id: 'lc-p1', name: 'P1' },
        { id: 'lc-p2', name: 'P2' },
        { id: 'lc-p3', name: 'P3' },
        { id: 'lc-p4', name: 'P4' },
        { id: 'lc-p5', name: 'P5' },
        { id: 'lc-p6', name: 'P6' },
      ],
    },
  ])

  const [cellData, setCellData] = useState<Record<string, string>>({
    'la-la-p1-day': '입력',
    'la-la-p1-night': '입력',
    'la-la-p2-day': '입력',
    'la-la-p2-night': '입력',
    'la-la-p3-day': '입력',
    'la-la-p3-night': '입력',
    'lb-lb-p1-day': '입력',
    'lb-lb-p1-night': '입력',
    'lb-lb-p2-day': '입력',
    'lb-lb-p2-night': '입력',
  })

  const [draggedItem, setDraggedItem] = useState<Line | Process | null>(null)
  const [draggedType, setDraggedType] = useState<'line' | 'process' | null>(null)
  const [draggedLineId, setDraggedLineId] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editingProcess, setEditingProcess] = useState<string | null>(null)

  // 라인 추가
  const addLine = () => {
    const newId = `l${Date.now()}`
    const newLine: Line = {
      id: newId,
      name: `라인${lines.length + 1}`,
      processes: [{ id: `${newId}-p1`, name: 'P1' }],
    }
    setLines((prev) => [...prev, newLine])

    // 새 라인의 셀 데이터 초기화
    const newCellData = { ...cellData }
    newCellData[`${newId}-${newId}-p1-day`] = '입력'
    newCellData[`${newId}-${newId}-p1-night`] = '입력'
    setCellData(newCellData)
  }

  // 라인 제거
  const removeLine = (lineId: string) => {
    if (lines.length <= 1) return
    setLines((prev) => prev.filter((l) => l.id !== lineId))

    // 해당 라인의 데이터 제거
    const newCellData = { ...cellData }

    Object.keys(newCellData).forEach((key) => {
      if (key.startsWith(`${lineId}-`)) {
        delete newCellData[key]
      }
    })

    setCellData(newCellData)
  }

  // 공정 추가
  const addProcess = (lineId: string) => {
    const line = lines.find((l) => l.id === lineId)
    if (!line) return

    const newProcessId = `${lineId}-p${line.processes.length + 1}`
    const newProcess: Process = { id: newProcessId, name: `P${line.processes.length + 1}` }

    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, processes: [...l.processes, newProcess] } : l)),
    )

    // 새 공정의 셀 데이터 초기화
    const newCellData = { ...cellData }
    newCellData[`${lineId}-${newProcessId}-day`] = '입력'
    newCellData[`${lineId}-${newProcessId}-night`] = '입력'
    setCellData(newCellData)
  }

  // 공정 제거
  const removeProcess = (lineId: string, processId: string) => {
    const line = lines.find((l) => l.id === lineId)
    if (!line || line.processes.length <= 1) return

    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId ? { ...l, processes: l.processes.filter((p) => p.id !== processId) } : l,
      ),
    )

    // 해당 공정의 셀 데이터 제거
    const newCellData = { ...cellData }
    delete newCellData[`${lineId}-${processId}-day`]
    delete newCellData[`${lineId}-${processId}-night`]
    setCellData(newCellData)
  }

  // 드래그 시작
  const handleDragStart = (
    e: React.DragEvent,
    item: Line | Process,
    type: 'line' | 'process',
    lineId: string | null = null,
  ) => {
    setDraggedItem(item)
    setDraggedType(type)
    setDraggedLineId(lineId)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 드롭 핸들러
  const handleDrop = (
    e: React.DragEvent,
    targetItem: Line | Process,
    targetType: 'line' | 'process',
    targetLineId: string | null = null,
  ) => {
    e.preventDefault()

    if (draggedType !== targetType) return
    if (draggedItem?.id === targetItem.id) return

    if (targetType === 'process' && draggedLineId === targetLineId && draggedLineId) {
      // 같은 라인 내에서만 공정 순서 변경 가능
      const line = lines.find((l) => l.id === draggedLineId)
      if (!line || !draggedItem) return

      const draggedIndex = line.processes.findIndex((p) => p.id === draggedItem.id)
      const targetIndex = line.processes.findIndex((p) => p.id === targetItem.id)

      const newProcesses = [...line.processes]
      const [removed] = newProcesses.splice(draggedIndex, 1)
      newProcesses.splice(targetIndex, 0, removed)

      setLines((prev) =>
        prev.map((l) => (l.id === draggedLineId ? { ...l, processes: newProcesses } : l)),
      )
    } else if (targetType === 'line' && draggedItem) {
      const draggedIndex = lines.findIndex((l) => l.id === draggedItem.id)
      const targetIndex = lines.findIndex((l) => l.id === targetItem.id)

      const newLines = [...lines]
      const [removed] = newLines.splice(draggedIndex, 1)
      newLines.splice(targetIndex, 0, removed)

      setLines(newLines)
    }

    setDraggedItem(null)
    setDraggedType(null)
    setDraggedLineId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // 셀 데이터 업데이트
  const updateCellData = (key: string, value: string) => {
    setCellData((prev) => ({ ...prev, [key]: value }))
  }

  // 공정 이름 업데이트
  const updateProcessName = (lineId: string, processId: string, newName: string) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              processes: l.processes.map((p) => (p.id === processId ? { ...p, name: newName } : p)),
            }
          : l,
      ),
    )
  }

  // 라인 이름 업데이트
  const updateLineName = (lineId: string, newName: string) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, name: newName } : l)))
  }

  const getCellKey = (lineId: string, processId: string, shift: string) =>
    `${lineId}-${processId}-${shift}`

  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback()
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">작업장 관리</h1>
            <p className="text-gray-600 mt-2">
              라인과 공정을 드래그하여 순서를 변경하고, 클릭하여 편집할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 작업장 테이블 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
        <div className="overflow-auto max-h-screen">
          <table className="w-full border-collapse">
            {/* 헤더 */}
            <thead>
              <tr>
                <th className="w-40 border-b border-gray-300 p-2 bg-gray-100 text-sm font-semibold text-gray-700 sticky left-0 top-0 z-20">
                  라인/공정
                </th>
                <th className="border-b border-gray-300 p-2 bg-gray-100 text-sm font-semibold text-gray-700 sticky top-0 z-10"></th>
              </tr>
            </thead>

            {/* 바디 */}
            <tbody>
              {lines.map((line) => (
                <React.Fragment key={line.id}>
                  {/* 라인명 행 */}
                  <tr>
                    <td
                      className="border-b border-gray-300 p-2 bg-gray-50 group text-center sticky left-0 z-10"
                      draggable
                      onDragStart={(e) => handleDragStart(e, line, 'line')}
                      onDrop={(e) => handleDrop(e, line, 'line')}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <input
                          type="text"
                          value={line.name}
                          onChange={(e) => updateLineName(line.id, e.target.value)}
                          className="bg-transparent text-center border-none outline-none font-medium text-sm"
                        />
                        {lines.length > 1 && (
                          <button
                            onClick={() => removeLine(line.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2 ">
                      <div className="flex items-center gap-2" style={{ minWidth: 'max-content' }}>
                        {line.processes.map((process) => (
                          <div
                            key={process.id}
                            className="flex-shrink-0 w-40"
                            draggable
                            onDragStart={(e) => handleDragStart(e, process, 'process', line.id)}
                            onDrop={(e) => handleDrop(e, process, 'process', line.id)}
                            onDragOver={handleDragOver}
                          >
                            {/* 공정 이름 (초록색) */}
                            <div className="bg-green-100 text-green-800 p-2 rounded border border-green-200 w-full text-center relative group">
                              <div className="flex items-center justify-center gap-1">
                                <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                {editingProcess === process.id ? (
                                  <input
                                    type="text"
                                    value={process.name}
                                    onChange={(e) =>
                                      updateProcessName(line.id, process.id, e.target.value)
                                    }
                                    onBlur={() => setEditingProcess(null)}
                                    onKeyDown={(e) =>
                                      handleKeyDown(e, () => setEditingProcess(null))
                                    }
                                    className="bg-transparent text-center border-none outline-none font-medium w-12 text-xs"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    className="font-medium cursor-pointer hover:bg-green-200 px-1 rounded text-xs"
                                    onClick={() => setEditingProcess(process.id)}
                                  >
                                    {process.name}
                                  </span>
                                )}
                                {line.processes.length > 1 && (
                                  <button
                                    onClick={() => removeProcess(line.id, process.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* 공정 추가 버튼 */}
                        <div className="flex-shrink-0 w-40">
                          <div className="bg-green-100 text-green-800 p-2 rounded border border-green-200 w-full text-center">
                            <button
                              onClick={() => addProcess(line.id)}
                              className="w-full h-full flex items-center justify-center text-green-600 hover:text-green-800 text-xs font-medium"
                            >
                              공정 추가
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* 주간 행 */}
                  <tr>
                    <td className="border-b border-gray-300 p-2 bg-gray-50 text-center text-sm font-medium sticky left-0 z-10">
                      주간
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div className="flex items-center gap-2" style={{ minWidth: 'max-content' }}>
                        {line.processes.map((process) => {
                          const cellKey = getCellKey(line.id, process.id, 'day')
                          const cellValue = cellData[cellKey] || '입력'

                          return (
                            <div key={process.id} className="flex-shrink-0 w-40">
                              <div className="border border-gray-300 p-1 w-full h-8 bg-white rounded">
                                {editingCell === cellKey ? (
                                  <input
                                    type="text"
                                    value={cellValue}
                                    onChange={(e) => updateCellData(cellKey, e.target.value)}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => handleKeyDown(e, () => setEditingCell(null))}
                                    className="w-full bg-transparent border-none outline-none text-center text-xs"
                                    autoFocus
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded text-xs"
                                    onClick={() => setEditingCell(cellKey)}
                                  >
                                    {cellValue}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* 공정 추가 버튼 영역 */}
                        <div className="flex-shrink-0 w-24">
                          <div className="border border-gray-300 p-1 w-full h-8 bg-gray-50 rounded"></div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* 야간 행 */}
                  <tr>
                    <td className="border-b border-gray-300 p-2 bg-gray-50 text-center text-sm font-medium sticky left-0 z-10">
                      야간
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div className="flex items-center gap-2" style={{ minWidth: 'max-content' }}>
                        {line.processes.map((process) => {
                          const cellKey = getCellKey(line.id, process.id, 'night')
                          const cellValue = cellData[cellKey] || '입력'

                          return (
                            <div key={process.id} className="flex-shrink-0 w-40">
                              <div className="border border-gray-300 p-1 w-full h-8 bg-white rounded">
                                {editingCell === cellKey ? (
                                  <input
                                    type="text"
                                    value={cellValue}
                                    onChange={(e) => updateCellData(cellKey, e.target.value)}
                                    onBlur={() => setEditingCell(null)}
                                    onKeyDown={(e) => handleKeyDown(e, () => setEditingCell(null))}
                                    className="w-full bg-transparent border-none outline-none text-center text-xs"
                                    autoFocus
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded text-xs"
                                    onClick={() => setEditingCell(cellKey)}
                                  >
                                    {cellValue}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* 공정 추가 버튼 영역 */}
                        <div className="flex-shrink-0 w-24">
                          <div className="border border-gray-300 p-1 w-full h-8 bg-gray-50 rounded"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {/* 라인 추가 버튼 행 */}
              <tr>
                <td
                  className="border border-gray-300 p-4 bg-blue-50 sticky left-0 z-10"
                  colSpan={2}
                >
                  <button
                    onClick={addLine}
                    className="w-full h-full flex items-center justify-center text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg font-medium transition-colors py-2"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    라인 추가
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NewProcessPage
