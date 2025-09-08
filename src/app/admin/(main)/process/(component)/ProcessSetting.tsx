'use client'
import React, { useState, useEffect } from 'react'
import ProcessContainer from '@/app/admin/(main)/process/(component)/ProcessContainer'
import DragList from '@/app/admin/(main)/process/(component)/DragList'
import { Button } from '@/components/ui/button'
import { LineModel } from '@/types/models/lineProcess.model'
import { getLineProcess, updateLineProcess } from '@/lib/api/line-process-api'
import { SaveLineDto } from '@/types/dto/lineProcess.dto'

/** 라인 선택 영역 */
const ProcessSetting = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [lines, setLines] = useState<LineModel[]>([])
  const [originalLines, setOriginalLines] = useState<LineModel[]>([])
  const [selectedLineId, setSelectedLineId] = useState(lines[0]?.id || '')
  const [hasChanges, setHasChanges] = useState(false)

  const selectedLine = lines.find((line) => line.id === selectedLineId)

  const fetchLineProcessData = async () => {
    const res = await getLineProcess()
    setLines(res)
    setOriginalLines(res)
    if (res.length > 0) {
      setSelectedLineId(res[0].id)
    }
  }

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        await fetchLineProcessData()
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // 변경사항 감지
  useEffect(() => {
    setHasChanges(JSON.stringify(lines) !== JSON.stringify(originalLines))
  }, [lines, originalLines])

  // 저장 핸들러
  const handleSave = async () => {
    const request: SaveLineDto = lines.map((line) => {
      const newProcesses = line.processes.map((process) => {
        if (process.id.split('_')[0] === 'temp') {
          return {
            name: process.name,
            order: process.order,
          }
        } else {
          return {
            id: process.id,
            name: process.name,
            order: process.order,
          }
        }
      })

      // 새로 추가하는 데이터
      if (line.id.split('_')[0] === 'temp') {
        return {
          name: line.name,
          order: line.order,
          processes: newProcesses,
        }
      } else {
        return {
          id: line.id,
          name: line.name,
          order: line.order,
          processes: newProcesses,
        }
      }
    })

    setIsLoading(true)
    try {
      // 서버에 저장하는 API 호출
      await updateLineProcess(request)
      setHasChanges(false)
      alert('변경사항이 저장되었습니다.')
    } catch (error) {
      console.error('Save failed:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 초기화 핸들러
  const handleReset = () => {
    if (hasChanges && confirm('변경사항이 손실됩니다. 초기화하시겠습니까?')) {
      setLines(originalLines)
      setSelectedLineId('1')
      setHasChanges(false)
    }
  }

  // 라인 드래그 앤 드롭 핸들러
  const handleLineDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (fromIndex !== toIndex) {
      const newLines = [...lines]
      const [movedLine] = newLines.splice(fromIndex, 1)
      newLines.splice(toIndex, 0, movedLine)
      // order 재정렬
      const reorderedLines = newLines.map((line, index) => ({
        ...line,
        order: index + 1,
      }))
      setLines(reorderedLines)
    }
  }

  // 공정 드래그 앤 드롭 핸들러
  const handleProcessDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (fromIndex !== toIndex && selectedLine) {
      const newProcesses = [...selectedLine.processes]
      const [movedProcess] = newProcesses.splice(fromIndex, 1)
      newProcesses.splice(toIndex, 0, movedProcess)

      setLines(
        lines.map((line) =>
          line.id === selectedLineId
            ? {
                ...line,
                processes: newProcesses.map((p, idx) => ({
                  ...p,
                  order: idx + 1,
                })),
              }
            : line,
        ),
      )
    }
  }

  // 라인 삭제 핸들러
  const handleDeleteLine = (lineId: string) => {
    if (confirm('라인을 삭제하시겠습니까? 모든 공정이 함께 삭제됩니다.')) {
      const newLines = lines.filter((line) => line.id !== lineId)
      setLines(newLines)
      if (selectedLineId === lineId) {
        setSelectedLineId(newLines[0]?.id || '')
      }
    }
  }

  // 공정 삭제 핸들러
  const handleDeleteProcess = (processId: string) => {
    if (confirm('공정을 삭제하시겠습니까?')) {
      setLines(
        lines.map((line) =>
          line.id === selectedLineId
            ? { ...line, processes: line.processes.filter((p: any) => p.id !== processId) }
            : line,
        ),
      )
    }
  }

  // 라인 추가 핸들러
  const handleAddLine = (name: string) => {
    const newLine = {
      id: `temp_${Date.now().toString()}`,
      name: name,
      order: lines.length + 1,
      processesLength: 0,
      processes: [],
    }
    setLines([...lines, newLine])
    setSelectedLineId(newLine.id)
  }

  // 공정 추가 핸들러
  const handleAddProcess = (name: string) => {
    if (!selectedLine) return

    const newProcess = {
      id: `temp_${Date.now().toString()}`,
      name: name,
      order: selectedLine.processes.length + 1,
    }

    setLines(
      lines.map((line) =>
        line.id === selectedLineId ? { ...line, processes: [...line.processes, newProcess] } : line,
      ),
    )
  }

  // 라인 편집 핸들러
  const handleEditLine = (lineId: string, name: string) => {
    setLines(lines.map((line) => (line.id === lineId ? { ...line, name } : line)))
  }

  // 공정 편집 핸들러
  const handleEditProcess = (processId: string, name: string) => {
    setLines(
      lines.map((line) =>
        line.id === selectedLineId
          ? {
              ...line,
              processes: line.processes.map((p: any) => (p.id === processId ? { ...p, name } : p)),
            }
          : line,
      ),
    )
  }

  if (isLoading && originalLines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-base text-gray-600">불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[66vh]">
            <ProcessContainer title={'라인'} />
            <div className="flex-1 overflow-y-auto">
              <DragList
                data={lines}
                selectedId={selectedLineId}
                setSelectedId={setSelectedLineId}
                onDrop={handleLineDrop}
                onDelete={handleDeleteLine}
                onAdd={handleAddLine}
                onEdit={handleEditLine}
                type="line"
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          {selectedLine && (
            <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 min-h-[66vh]">
              <ProcessContainer title={'공정'} selectedLine={selectedLine?.name} />
              <div className="flex-1 flex flex-col">
                <DragList
                  data={selectedLine.processes || []}
                  onDrop={handleProcessDrop}
                  onDelete={handleDeleteProcess}
                  onAdd={handleAddProcess}
                  onEdit={handleEditProcess}
                  type="process"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 변경사항 알림 하단 바 */}
      {hasChanges && (
        <div className="fixed top-0 left-0 right-0 bg-white border-t border-gray-200 py-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
            <p className="flex items-center text-sm ">
              저장되지 않은 변경사항이 있습니다.
              <br />
              수정을 완료하면 꼭 저장 버튼을 눌러주세요.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="text-lg text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                초기화
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                className="text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProcessSetting
