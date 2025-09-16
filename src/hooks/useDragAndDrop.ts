import { useState } from 'react'
import { LineResponseDto } from '@/types/line-with-process'
import { swapWaitingWorKerApi } from '@/lib/api/wating-worker-api'

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

  const handleWorkerDrop = async (
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

    // 워커 정보 저장 (스왑을 위해)
    const draggedWorker = {
      waitingWorkerId: draggedShift?.waitingWorkerId || null,
      waitingWorker: draggedShift?.waitingWorker || null,
    }

    const targetWorker = {
      waitingWorkerId: targetShift?.waitingWorkerId || null,
      waitingWorker: targetShift?.waitingWorker || null,
    }

    console.log('🔄 Swapping workers:', {
      draggedWorker: draggedWorker.waitingWorker?.name,
      targetWorker: targetWorker.waitingWorker?.name,
      draggedLocation: `${draggedProcessId}-${draggedItem.shiftType}`,
      targetLocation: `${targetProcessId}-${targetItem.shiftType}`,
    })

    const newLines = lines.map((line) => ({
      ...line,
      processes: line.processes.map((process) => ({
        ...process,
        shifts: process.shifts.map((shift) => {
          // 드래그된 워커의 원래 위치 - 타겟 워커로 교체
          if (
            line.id === draggedLineId &&
            process.id === draggedProcessId &&
            shift.type === draggedItem.shiftType
          ) {
            return {
              ...shift,
              waitingWorkerId: targetWorker.waitingWorkerId,
              waitingWorker: targetWorker.waitingWorker ? { ...targetWorker.waitingWorker } : null,
            }
          }

          // 타겟 워커의 위치 - 드래그된 워커로 교체
          if (
            line.id === targetLineId &&
            process.id === targetProcessId &&
            shift.type === targetItem.shiftType
          ) {
            return {
              ...shift,
              waitingWorkerId: draggedWorker.waitingWorkerId,
              waitingWorker: draggedWorker.waitingWorker
                ? { ...draggedWorker.waitingWorker }
                : null,
            }
          }

          return { ...shift }
        }),
      })),
    }))

    console.log('🔄 Before setLines:', lines.length)
    console.log('🔄 After setLines:', newLines.length)
    console.log('🔄 First line processes count:', newLines[0]?.processes?.length)

    // 강제 리렌더링을 위해 새로운 배열 참조 생성
    setLines([...newLines])

    try {
      const { data } = await swapWaitingWorKerApi(
        draggedProcessId,
        draggedItem.shiftType,
        targetProcessId,
        targetItem.shiftType,
      )
      setLines(data)
    } catch (e) {
      console.error(e)
    }

    console.log('✅ setLines called!')
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
