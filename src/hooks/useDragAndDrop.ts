import { useState } from 'react'
import { LineResponseDto } from '@/types/line-with-process'

export type DragType = 'line' | 'process' | 'worker'

interface DragState {
  draggedItem: any
  draggedType: DragType | null
  draggedLineId: string | null
  draggedProcessId: string | null
  draggedShiftId: string | null
}

export const useDragAndDrop = (
  lines: LineResponseDto[],
  setLines: (lines: LineResponseDto[]) => void,
) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    draggedType: null,
    draggedLineId: null,
    draggedProcessId: null,
    draggedShiftId: null,
  })

  const handleDragStart = (
    e: React.DragEvent,
    item: any,
    type: DragType,
    lineId?: string,
    processId?: string,
    shiftId?: string,
  ) => {
    setDragState({
      draggedItem: item,
      draggedType: type,
      draggedLineId: lineId || null,
      draggedProcessId: processId || null,
      draggedShiftId: shiftId || null,
    })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (
    e: React.DragEvent,
    targetItem: any,
    targetType: DragType,
    targetLineId?: string,
    targetProcessId?: string,
    targetShiftId?: string,
  ) => {
    e.preventDefault()

    if (dragState.draggedType !== targetType) return

    if (targetType === 'line') {
      handleLineDrop(targetItem)
    } else if (targetType === 'process') {
      handleProcessDrop(targetItem, targetLineId)
    } else if (targetType === 'worker') {
      handleWorkerDrop(
        targetItem,
        dragState.draggedItem,
        targetLineId,
        targetProcessId,
        dragState.draggedLineId!,
        dragState.draggedProcessId!,
      )
    }

    resetDragState()
  }

  const handleLineDrop = (targetLine: LineResponseDto) => {
    if (!dragState.draggedItem || dragState.draggedItem.id === targetLine.id) return

    const draggedIndex = lines.findIndex((l) => l.id === dragState.draggedItem.id)
    const targetIndex = lines.findIndex((l) => l.id === targetLine.id)

    const newLines = [...lines]
    const [removed] = newLines.splice(draggedIndex, 1)
    newLines.splice(targetIndex, 0, removed)

    // order 재정렬
    const updatedLines = newLines.map((line, index) => ({
      ...line,
      order: index + 1,
    }))

    setLines(updatedLines)
  }

  const handleProcessDrop = (targetProcess: any, targetLineId?: string) => {
    if (
      !dragState.draggedItem ||
      !dragState.draggedLineId ||
      !targetLineId ||
      dragState.draggedLineId !== targetLineId ||
      dragState.draggedItem.id === targetProcess.id
    )
      return

    const newLines = lines.map((line) => {
      if (line.id === targetLineId) {
        const draggedIndex = line.processes.findIndex((p) => p.id === dragState.draggedItem.id)
        const targetIndex = line.processes.findIndex((p) => p.id === targetProcess.id)

        const newProcesses = [...line.processes]
        const [removed] = newProcesses.splice(draggedIndex, 1)
        newProcesses.splice(targetIndex, 0, removed)

        // order 재정렬
        const updatedProcesses = newProcesses.map((process, index) => ({
          ...process,
          order: index + 1,
        }))

        return { ...line, processes: updatedProcesses }
      }
      return line
    })

    setLines(newLines)
  }

  const handleWorkerDrop = (
    targetItem: any, // { processId, shiftType }
    draggedItem: any, // { processId, shiftType }
    targetLineId?: string,
    targetProcessId?: string,
    draggedLineId?: string,
    draggedProcessId?: string,
  ) => {
    // 같은 셀끼리 드롭하면 무시
    if (targetProcessId === draggedProcessId && targetItem.shiftType === draggedItem.shiftType)
      return

    if (!targetLineId || !targetProcessId || !draggedLineId || !draggedProcessId) return

    // 현재 데이터에서 실제 shift 정보 찾기
    const findShiftInLines = (lineId: string, processId: string, shiftType: string) => {
      const line = lines.find((l) => l.id === lineId)
      const process = line?.processes.find((p) => p.id === processId)
      return process?.shifts.find((s) => s.type === shiftType)
    }

    const draggedShift = findShiftInLines(draggedLineId, draggedProcessId, draggedItem.shiftType)
    const targetShift = findShiftInLines(targetLineId, targetProcessId, targetItem.shiftType)

    // 워커 정보 저장
    const draggedWorker = {
      waitingWorkerId: draggedShift?.waitingWorkerId || null,
      waitingWorker: draggedShift?.waitingWorker || null,
    }

    const targetWorker = {
      waitingWorkerId: targetShift?.waitingWorkerId || null,
      waitingWorker: targetShift?.waitingWorker || null,
    }

    const newLines = lines.map((line) => {
      if (line.id === targetLineId || line.id === draggedLineId) {
        return {
          ...line,
          processes: line.processes.map((process) => {
            let updatedProcess = { ...process }

            // 같은 프로세스인 경우 (같은 라인 내에서 주간↔야간)
            if (
              process.id === targetProcessId &&
              process.id === draggedProcessId &&
              line.id === targetLineId &&
              line.id === draggedLineId
            ) {
              const targetShiftType = targetItem.shiftType
              const draggedShiftType = draggedItem.shiftType

              // 두 shift를 동시에 처리
              let updatedShifts = [...process.shifts]

              // 타겟 shift 처리
              const targetShiftIndex = updatedShifts.findIndex((s) => s.type === targetShiftType)
              if (targetShiftIndex >= 0) {
                updatedShifts[targetShiftIndex] = {
                  ...updatedShifts[targetShiftIndex],
                  waitingWorkerId: draggedWorker.waitingWorkerId,
                  waitingWorker: draggedWorker.waitingWorker,
                }
              } else {
                updatedShifts.push({
                  id: `new-shift-${Date.now()}`,
                  type: targetShiftType,
                  status: 'NORMAL' as const,
                  processId: process.id,
                  waitingWorkerId: draggedWorker.waitingWorkerId,
                  waitingWorker: draggedWorker.waitingWorker,
                })
              }

              // 드래그된 shift 처리
              const draggedShiftIndex = updatedShifts.findIndex((s) => s.type === draggedShiftType)
              if (draggedShiftIndex >= 0) {
                updatedShifts[draggedShiftIndex] = {
                  ...updatedShifts[draggedShiftIndex],
                  waitingWorkerId: targetWorker.waitingWorkerId,
                  waitingWorker: targetWorker.waitingWorker,
                }
              } else {
                updatedShifts.push({
                  id: `new-shift-${Date.now()}-2`,
                  type: draggedShiftType,
                  status: 'NORMAL' as const,
                  processId: process.id,
                  waitingWorkerId: targetWorker.waitingWorkerId,
                  waitingWorker: targetWorker.waitingWorker,
                })
              }

              return { ...process, shifts: updatedShifts }
            }
            // 다른 프로세스인 경우 (서로 다른 라인 또는 같은 라인의 다른 프로세스)
            else if (process.id === targetProcessId && line.id === targetLineId) {
              // 타겟 프로세스 처리 - 드래그된 워커로 교체
              const targetShiftType = targetItem.shiftType
              const existingShiftIndex = process.shifts.findIndex((s) => s.type === targetShiftType)

              if (existingShiftIndex >= 0) {
                const updatedShifts = [...process.shifts]
                updatedShifts[existingShiftIndex] = {
                  ...updatedShifts[existingShiftIndex],
                  waitingWorkerId: draggedWorker.waitingWorkerId,
                  waitingWorker: draggedWorker.waitingWorker,
                }
                return { ...process, shifts: updatedShifts }
              } else {
                const newShift = {
                  id: `new-shift-${Date.now()}`,
                  type: targetShiftType,
                  status: 'NORMAL' as const,
                  processId: process.id,
                  waitingWorkerId: draggedWorker.waitingWorkerId,
                  waitingWorker: draggedWorker.waitingWorker,
                }
                return { ...process, shifts: [...process.shifts, newShift] }
              }
            } else if (process.id === draggedProcessId && line.id === draggedLineId) {
              // 드래그된 프로세스 처리 - 타겟 워커로 교체
              const draggedShiftType = draggedItem.shiftType
              const existingShiftIndex = process.shifts.findIndex(
                (s) => s.type === draggedShiftType,
              )

              if (existingShiftIndex >= 0) {
                const updatedShifts = [...process.shifts]
                updatedShifts[existingShiftIndex] = {
                  ...updatedShifts[existingShiftIndex],
                  waitingWorkerId: targetWorker.waitingWorkerId,
                  waitingWorker: targetWorker.waitingWorker,
                }
                return { ...process, shifts: updatedShifts }
              } else {
                const newShift = {
                  id: `new-shift-${Date.now()}-2`,
                  type: draggedShiftType,
                  status: 'NORMAL' as const,
                  processId: process.id,
                  waitingWorkerId: targetWorker.waitingWorkerId,
                  waitingWorker: targetWorker.waitingWorker,
                }
                return { ...process, shifts: [...process.shifts, newShift] }
              }
            }

            return process
          }),
        }
      }
      return line
    })

    setLines(newLines)
  }

  const resetDragState = () => {
    setDragState({
      draggedItem: null,
      draggedType: null,
      draggedLineId: null,
      draggedProcessId: null,
      draggedShiftId: null,
    })
  }

  const handleDragEnd = () => {
    resetDragState()
  }

  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    resetDragState,
    isDragging: dragState.draggedType !== null,
  }
}
