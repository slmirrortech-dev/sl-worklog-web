import React, { useState } from 'react'
import { LineResponseDto } from '@/types/line-with-process'

/**
 * 라인 공정 편집 관련 hook
 **/
const useEditLineWithProcess = (
  lineWithProcess: LineResponseDto[],
  setLineWithProcess: any,
  tempLineWithProcess: LineResponseDto[],
  setTempLineWithProcess: any,
) => {
  const [editValue, setEditValue] = useState('')
  const [editingLine, setEditingLine] = useState<string | null>(null)
  const [editingProcess, setEditingProcess] = useState<string | null>(null)

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
    // if (!lockInfo.isEditMode) return
    setEditingLine(lineId)
    setEditValue(currentName)
  }

  // 공정 이름 편집 시작
  const handleStartEditProcess = (processId: string, currentName: string) => {
    // if (!lockInfo.isEditMode) return
    setEditingProcess(processId)
    setEditValue(currentName)
  }

  // 라인 이름 입력 후 동작
  const handleSaveLineEdit = () => {
    if (!editingLine) return
    const newName = editValue.trim() || '라인 이름'
    const updatedLines = tempLineWithProcess.map((line) =>
      line.id === editingLine ? { ...line, name: newName } : line,
    )
    setTempLineWithProcess(updatedLines)
    setEditingLine(null)
    setEditValue('')
  }

  // 공정 이름 입력 후 동작
  const handleSaveProcessEdit = () => {
    if (!editingProcess) return
    const newName = editValue.trim() || '공정 이름'
    const updatedLines = tempLineWithProcess.map((line) => ({
      ...line,
      processes: line.processes.map((process) =>
        process.id === editingProcess ? { ...process, name: newName } : process,
      ),
    }))
    setTempLineWithProcess(updatedLines)
    setEditingProcess(null)
    setEditValue('')
  }

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingLine) handleSaveLineEdit()
      if (editingProcess) handleSaveProcessEdit()
    }
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

  return {
    editValue,
    setEditValue,
    editingLine,
    setEditingLine,
    editingProcess,
    setEditingProcess,
    handleAddLine,
    handleAddProcess,
    handleStartEditLine,
    handleStartEditProcess,
    handleSaveLineEdit,
    handleSaveProcessEdit,
    handleKeyDown,
    handleDeleteLine,
    handleDeleteProcess,
  }
}

export default useEditLineWithProcess
