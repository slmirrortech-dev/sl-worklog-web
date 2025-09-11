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
      name: 'LA',
      processes: [
        { id: 'la-p1', name: 'P1' },
        { id: 'la-p2', name: 'P2' },
        { id: 'la-p3', name: 'P3' }
      ]
    },
    {
      id: 'lb',
      name: 'LB',
      processes: [
        { id: 'lb-pb', name: 'PB' },
        { id: 'lb-pa', name: 'PA' }
      ]
    }
  ])

  const [cellData, setCellData] = useState<Record<string, string>>({
    'la-la-p1-day': '', 'la-la-p1-night': '',
    'la-la-p2-day': '', 'la-la-p2-night': '',
    'la-la-p3-day': '', 'la-la-p3-night': '',
    'lb-lb-pb-day': '', 'lb-lb-pb-night': '',
    'lb-lb-pa-day': '', 'lb-lb-pa-night': ''
  })

  const [statusData, setStatusData] = useState<Record<string, string>>({
    'la-day': '정상가동', 'la-night': '잠업',
    'lb-day': '정상가동', 'lb-night': '잠업'
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
      name: `L${String.fromCharCode(65 + lines.length)}`,
      processes: [{ id: `${newId}-p1`, name: 'P1' }]
    }
    setLines(prev => [...prev, newLine])
    
    // 새 라인의 상태 데이터 초기화
    setStatusData(prev => ({
      ...prev,
      [`${newId}-day`]: '',
      [`${newId}-night`]: ''
    }))
    
    // 새 라인의 셀 데이터 초기화
    const newCellData = { ...cellData }
    newCellData[`${newId}-${newId}-p1-day`] = ''
    newCellData[`${newId}-${newId}-p1-night`] = ''
    setCellData(newCellData)
  }

  // 라인 제거
  const removeLine = (lineId: string) => {
    if (lines.length <= 1) return
    setLines(prev => prev.filter(l => l.id !== lineId))
    
    // 해당 라인의 데이터 제거
    const newCellData = { ...cellData }
    const newStatusData = { ...statusData }
    
    Object.keys(newCellData).forEach(key => {
      if (key.startsWith(`${lineId}-`)) {
        delete newCellData[key]
      }
    })
    
    delete newStatusData[`${lineId}-day`]
    delete newStatusData[`${lineId}-night`]
    
    setCellData(newCellData)
    setStatusData(newStatusData)
  }

  // 공정 추가
  const addProcess = (lineId: string) => {
    const line = lines.find(l => l.id === lineId)
    if (!line) return
    
    const newProcessId = `${lineId}-p${line.processes.length + 1}`
    const newProcess: Process = { id: newProcessId, name: `P${line.processes.length + 1}` }
    
    setLines(prev => prev.map(l => 
      l.id === lineId 
        ? { ...l, processes: [...l.processes, newProcess] }
        : l
    ))
    
    // 새 공정의 셀 데이터 초기화
    const newCellData = { ...cellData }
    newCellData[`${lineId}-${newProcessId}-day`] = ''
    newCellData[`${lineId}-${newProcessId}-night`] = ''
    setCellData(newCellData)
  }

  // 공정 제거
  const removeProcess = (lineId: string, processId: string) => {
    const line = lines.find(l => l.id === lineId)
    if (!line || line.processes.length <= 1) return
    
    setLines(prev => prev.map(l => 
      l.id === lineId 
        ? { ...l, processes: l.processes.filter(p => p.id !== processId) }
        : l
    ))
    
    // 해당 공정의 셀 데이터 제거
    const newCellData = { ...cellData }
    delete newCellData[`${lineId}-${processId}-day`]
    delete newCellData[`${lineId}-${processId}-night`]
    setCellData(newCellData)
  }

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, item: Line | Process, type: 'line' | 'process', lineId: string | null = null) => {
    setDraggedItem(item)
    setDraggedType(type)
    setDraggedLineId(lineId)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 드롭 핸들러
  const handleDrop = (e: React.DragEvent, targetItem: Line | Process, targetType: 'line' | 'process', targetLineId: string | null = null) => {
    e.preventDefault()
    
    if (draggedType !== targetType) return
    if (draggedItem?.id === targetItem.id) return

    if (targetType === 'process' && draggedLineId === targetLineId && draggedLineId) {
      // 같은 라인 내에서만 공정 순서 변경 가능
      const line = lines.find(l => l.id === draggedLineId)
      if (!line || !draggedItem) return
      
      const draggedIndex = line.processes.findIndex(p => p.id === draggedItem.id)
      const targetIndex = line.processes.findIndex(p => p.id === targetItem.id)
      
      const newProcesses = [...line.processes]
      const [removed] = newProcesses.splice(draggedIndex, 1)
      newProcesses.splice(targetIndex, 0, removed)
      
      setLines(prev => prev.map(l => 
        l.id === draggedLineId 
          ? { ...l, processes: newProcesses }
          : l
      ))
    } else if (targetType === 'line' && draggedItem) {
      const draggedIndex = lines.findIndex(l => l.id === draggedItem.id)
      const targetIndex = lines.findIndex(l => l.id === targetItem.id)
      
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
    setCellData(prev => ({ ...prev, [key]: value }))
  }

  // 상태 데이터 업데이트
  const updateStatusData = (key: string, value: string) => {
    setStatusData(prev => ({ ...prev, [key]: value }))
  }

  // 공정 이름 업데이트
  const updateProcessName = (lineId: string, processId: string, newName: string) => {
    setLines(prev => prev.map(l => 
      l.id === lineId 
        ? { 
            ...l, 
            processes: l.processes.map(p => 
              p.id === processId ? { ...p, name: newName } : p
            )
          }
        : l
    ))
  }

  // 라인 이름 업데이트
  const updateLineName = (lineId: string, newName: string) => {
    setLines(prev => prev.map(l => 
      l.id === lineId ? { ...l, name: newName } : l
    ))
  }

  const getCellKey = (lineId: string, processId: string, shift: string) => `${lineId}-${processId}-${shift}`
  const getStatusKey = (lineId: string, shift: string) => `${lineId}-${shift}`

  const getStatusColor = (value: string) => {
    if (value === '공정 추가') return 'bg-green-200 text-green-800'
    if (value === '정상가동') return 'bg-blue-200 text-blue-800'
    if (value === '잠업') return 'bg-red-200 text-red-800'
    return 'bg-gray-100'
  }

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* 헤더 */}
            <thead>
              <tr>
                <th className="border border-gray-300 p-4 bg-gray-50 w-32 text-sm font-semibold text-gray-700">
                  라인/공정
                </th>
                <th className="border border-gray-300 p-4 bg-gray-50 min-w-96 text-sm font-semibold text-gray-700">
                  공정
                </th>
                <th className="border border-gray-300 p-4 bg-gray-50 w-32 text-sm font-semibold text-gray-700">
                  상태
                </th>
              </tr>
            </thead>

            {/* 바디 */}
            <tbody>
              {lines.map((line) => (
                <React.Fragment key={line.id}>
                  {/* 주간 행 */}
                  <tr className="hover:bg-gray-50">
                    <td 
                      rowSpan={2}
                      className="border border-gray-300 p-4 bg-gray-50 relative group text-center"
                      draggable
                      onDragStart={(e) => handleDragStart(e, line, 'line')}
                      onDrop={(e) => handleDrop(e, line, 'line')}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <input
                            type="text"
                            value={line.name}
                            onChange={(e) => updateLineName(line.id, e.target.value)}
                            className="bg-transparent text-center border-none outline-none font-medium w-16 text-sm"
                          />
                        </div>
                        <div className="flex flex-col text-xs text-gray-600 gap-1">
                          <span className="font-medium">주간</span>
                          <span className="font-medium">야간</span>
                        </div>
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

                    {/* 공정들 - 주간 */}
                    <td className="border border-gray-300 p-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {line.processes.map((process) => {
                          const cellKey = getCellKey(line.id, process.id, 'day')
                          const cellValue = cellData[cellKey] || ''

                          return (
                            <div 
                              key={process.id}
                              className="flex flex-col items-center gap-2 min-w-24"
                              draggable
                              onDragStart={(e) => handleDragStart(e, process, 'process', line.id)}
                              onDrop={(e) => handleDrop(e, process, 'process', line.id)}
                              onDragOver={handleDragOver}
                            >
                              {/* 공정 이름 */}
                              <div className="bg-green-100 text-green-800 p-2 rounded-lg border border-green-200 w-full text-center relative group">
                                <div className="flex items-center justify-center gap-1">
                                  <GripVertical className="w-3 h-3 text-gray-400 cursor-move" />
                                  {editingProcess === process.id ? (
                                    <input
                                      type="text"
                                      value={process.name}
                                      onChange={(e) => updateProcessName(line.id, process.id, e.target.value)}
                                      onBlur={() => setEditingProcess(null)}
                                      onKeyDown={(e) => handleKeyDown(e, () => setEditingProcess(null))}
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

                              {/* 주간 데이터 입력 셀 */}
                              <div className="border border-gray-300 p-2 w-full h-10 bg-white rounded">
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
                                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded text-xs"
                                    onClick={() => setEditingCell(cellKey)}
                                  >
                                    {cellValue || '입력'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* 공정 추가 버튼 */}
                        <div className="flex flex-col items-center gap-2 min-w-24">
                          <div className="bg-green-100 text-green-800 p-2 rounded-lg border border-green-200 w-full text-center">
                            <button
                              onClick={() => addProcess(line.id)}
                              className="w-full h-full flex items-center justify-center text-green-600 hover:text-green-800 text-xs font-medium"
                            >
                              공정 추가
                            </button>
                          </div>
                          <div className="border border-gray-300 p-2 w-full h-10 bg-gray-50 rounded"></div>
                        </div>
                      </div>
                    </td>

                    {/* 상태 - 주간 */}
                    <td className={`border border-gray-300 p-2 text-center ${getStatusColor(statusData[getStatusKey(line.id, 'day')])}`}>
                      {editingCell === getStatusKey(line.id, 'day') ? (
                        <input
                          type="text"
                          value={statusData[getStatusKey(line.id, 'day')] || ''}
                          onChange={(e) => updateStatusData(getStatusKey(line.id, 'day'), e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => handleKeyDown(e, () => setEditingCell(null))}
                          className="w-full bg-transparent border-none outline-none text-center text-sm"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="w-full h-10 flex items-center justify-center cursor-pointer hover:bg-opacity-75 rounded text-sm font-medium"
                          onClick={() => setEditingCell(getStatusKey(line.id, 'day'))}
                        >
                          {statusData[getStatusKey(line.id, 'day')] || '입력'}
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* 야간 행 */}
                  <tr className="hover:bg-gray-50">
                    {/* 공정들 - 야간 */}
                    <td className="border border-gray-300 p-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {line.processes.map((process) => {
                          const cellKey = getCellKey(line.id, process.id, 'night')
                          const cellValue = cellData[cellKey] || ''

                          return (
                            <div key={process.id} className="flex flex-col items-center min-w-24">
                              {/* 야간 데이터 입력 셀 */}
                              <div className="border border-gray-300 p-2 w-full h-10 bg-white rounded">
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
                                    className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded text-xs"
                                    onClick={() => setEditingCell(cellKey)}
                                  >
                                    {cellValue || '입력'}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        {/* 공정 추가 버튼 영역 */}
                        <div className="flex flex-col items-center min-w-24">
                          <div className="border border-gray-300 p-2 w-full h-10 bg-gray-50 rounded"></div>
                        </div>
                      </div>
                    </td>

                    {/* 상태 - 야간 */}
                    <td className={`border border-gray-300 p-2 text-center ${getStatusColor(statusData[getStatusKey(line.id, 'night')])}`}>
                      {editingCell === getStatusKey(line.id, 'night') ? (
                        <input
                          type="text"
                          value={statusData[getStatusKey(line.id, 'night')] || ''}
                          onChange={(e) => updateStatusData(getStatusKey(line.id, 'night'), e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => handleKeyDown(e, () => setEditingCell(null))}
                          className="w-full bg-transparent border-none outline-none text-center text-sm"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="w-full h-10 flex items-center justify-center cursor-pointer hover:bg-opacity-75 rounded text-sm font-medium"
                          onClick={() => setEditingCell(getStatusKey(line.id, 'night'))}
                        >
                          {statusData[getStatusKey(line.id, 'night')] || '입력'}
                        </div>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {/* 라인 추가 버튼 행 */}
              <tr>
                <td className="border border-gray-300 p-4 bg-blue-50" colSpan={3}>
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