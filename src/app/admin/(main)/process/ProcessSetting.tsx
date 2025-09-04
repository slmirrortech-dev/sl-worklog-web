'use client'
import React, { useState, useEffect } from 'react'
import ProcessContainer from '@/app/admin/(main)/process/ProcessContainer'
import DragList from '@/app/admin/(main)/process/DragList'
import { Button } from '@/components/ui/button'

// 변환된 전체 데이터
// 변환된 전체 데이터 (린지원 포함, depth1에도 order 추가)
const initialLines = [
  {
    id: '1',
    name: 'MV L/R',
    order: 1,
    processes: [
      { id: '1-1', name: 'P1', order: 1 },
      { id: '1-2', name: 'P2', order: 2 },
      { id: '1-3', name: 'P3', order: 3 },
      { id: '1-4', name: 'P4', order: 4 },
      { id: '1-5', name: 'P5', order: 5 },
      { id: '1-6', name: 'P6', order: 6 },
      { id: '1-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '2',
    name: 'MX5 LH',
    order: 2,
    processes: [
      { id: '2-1', name: 'P1', order: 1 },
      { id: '2-2', name: 'P2', order: 2 },
      { id: '2-3', name: 'P3', order: 3 },
      { id: '2-4', name: 'P4', order: 4 },
      { id: '2-5', name: 'P5', order: 5 },
      { id: '2-6', name: 'P6', order: 6 },
      { id: '2-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '3',
    name: 'MX5 RH',
    order: 3,
    processes: [
      { id: '3-1', name: 'P1', order: 1 },
      { id: '3-2', name: 'P2', order: 2 },
      { id: '3-3', name: 'P3', order: 3 },
      { id: '3-4', name: 'P4', order: 4 },
      { id: '3-5', name: 'P5', order: 5 },
      { id: '3-6', name: 'P6', order: 6 },
      { id: '3-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '4',
    name: 'MQ4 LH',
    order: 4,
    processes: [
      { id: '4-1', name: 'P1', order: 1 },
      { id: '4-2', name: 'P2', order: 2 },
      { id: '4-3', name: 'P3', order: 3 },
      { id: '4-4', name: 'P4', order: 4 },
      { id: '4-5', name: 'P5', order: 5 },
      { id: '4-6', name: 'P6', order: 6 },
      { id: '4-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '5',
    name: 'MQ4 RH',
    order: 5,
    processes: [
      { id: '5-1', name: 'P1', order: 1 },
      { id: '5-2', name: 'P2', order: 2 },
      { id: '5-3', name: 'P3', order: 3 },
      { id: '5-4', name: 'P4', order: 4 },
      { id: '5-5', name: 'P5', order: 5 },
      { id: '5-6', name: 'P6', order: 6 },
      { id: '5-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '6',
    name: 'AX/CV/SG2 LH',
    order: 6,
    processes: [
      { id: '6-1', name: 'P1', order: 1 },
      { id: '6-2', name: 'P2', order: 2 },
      { id: '6-3', name: 'P3', order: 3 },
      { id: '6-4', name: 'P4', order: 4 },
      { id: '6-5', name: 'P5', order: 5 },
      { id: '6-6', name: 'P6', order: 6 },
      { id: '6-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '7',
    name: 'AX/CV/SG2 RH',
    order: 7,
    processes: [
      { id: '7-1', name: 'P1', order: 1 },
      { id: '7-2', name: 'P2', order: 2 },
      { id: '7-3', name: 'P3', order: 3 },
      { id: '7-4', name: 'P4', order: 4 },
      { id: '7-5', name: 'P5', order: 5 },
      { id: '7-6', name: 'P6', order: 6 },
      { id: '7-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '8',
    name: 'SW L/R',
    order: 8,
    processes: [
      { id: '8-1', name: 'P1', order: 1 },
      { id: '8-2', name: 'P2', order: 2 },
      { id: '8-3', name: 'P3', order: 3 },
      { id: '8-4', name: 'P4', order: 4 },
      { id: '8-5', name: 'P5', order: 5 },
      { id: '8-6', name: 'P6', order: 6 },
      { id: '8-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '9',
    name: 'LB L/R',
    order: 9,
    processes: [
      { id: '9-1', name: 'P1', order: 1 },
      { id: '9-2', name: 'P2', order: 2 },
      { id: '9-3', name: 'P3', order: 3 },
      { id: '9-4', name: 'P4', order: 4 },
      { id: '9-5', name: 'P5', order: 5 },
      { id: '9-6', name: 'P6', order: 6 },
      { id: '9-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '10',
    name: 'NX4A L/R',
    order: 10,
    processes: [
      { id: '10-1', name: 'P1', order: 1 },
      { id: '10-2', name: 'P2', order: 2 },
      { id: '10-3', name: 'P3', order: 3 },
      { id: '10-4', name: 'P4', order: 4 },
      { id: '10-5', name: 'P5', order: 5 },
      { id: '10-6', name: 'P6', order: 6 },
      { id: '10-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '11',
    name: 'NQ5 LH',
    order: 11,
    processes: [
      { id: '11-1', name: 'P1', order: 1 },
      { id: '11-2', name: 'P2', order: 2 },
      { id: '11-3', name: 'P3', order: 3 },
      { id: '11-4', name: 'P4', order: 4 },
      { id: '11-5', name: 'P5', order: 5 },
      { id: '11-6', name: 'P6', order: 6 },
      { id: '11-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '12',
    name: 'NQ5 RH',
    order: 12,
    processes: [
      { id: '12-1', name: 'P1', order: 1 },
      { id: '12-2', name: 'P2', order: 2 },
      { id: '12-3', name: 'P3', order: 3 },
      { id: '12-4', name: 'P4', order: 4 },
      { id: '12-5', name: 'P5', order: 5 },
      { id: '12-6', name: 'P6', order: 6 },
      { id: '12-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '13',
    name: 'C121 L/R',
    order: 13,
    processes: [
      { id: '13-1', name: 'P1', order: 1 },
      { id: '13-2', name: 'P2', order: 2 },
      { id: '13-3', name: 'P3', order: 3 },
      { id: '13-4', name: 'P4', order: 4 },
      { id: '13-5', name: 'P5', order: 5 },
      { id: '13-6', name: 'P6', order: 6 },
      { id: '13-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '14',
    name: 'OV1K L/R',
    order: 14,
    processes: [
      { id: '14-1', name: 'P1', order: 1 },
      { id: '14-2', name: 'P2', order: 2 },
      { id: '14-3', name: 'P3', order: 3 },
      { id: '14-4', name: 'P4', order: 4 },
      { id: '14-5', name: 'P5', order: 5 },
      { id: '14-6', name: 'P6', order: 6 },
      { id: '14-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '15',
    name: 'LQ2 L/R',
    order: 15,
    processes: [
      { id: '15-1', name: 'P1', order: 1 },
      { id: '15-2', name: 'P2', order: 2 },
      { id: '15-3', name: 'P3', order: 3 },
      { id: '15-4', name: 'P4', order: 4 },
      { id: '15-5', name: 'P5', order: 5 },
      { id: '15-6', name: 'P6', order: 6 },
      { id: '15-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '16',
    name: 'JA/YB LH',
    order: 16,
    processes: [
      { id: '16-1', name: 'P1', order: 1 },
      { id: '16-2', name: 'P2', order: 2 },
      { id: '16-3', name: 'P3', order: 3 },
      { id: '16-4', name: 'P4', order: 4 },
      { id: '16-5', name: 'P5', order: 5 },
      { id: '16-6', name: 'P6', order: 6 },
      { id: '16-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '17',
    name: 'JA/YB RH',
    order: 17,
    processes: [
      { id: '17-1', name: 'P1', order: 1 },
      { id: '17-2', name: 'P2', order: 2 },
      { id: '17-3', name: 'P3', order: 3 },
      { id: '17-4', name: 'P4', order: 4 },
      { id: '17-5', name: 'P5', order: 5 },
      { id: '17-6', name: 'P6', order: 6 },
      { id: '17-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '18',
    name: 'SV/CT/NH2 LH',
    order: 18,
    processes: [
      { id: '18-1', name: 'P1', order: 1 },
      { id: '18-2', name: 'P2', order: 2 },
      { id: '18-3', name: 'P3', order: 3 },
      { id: '18-4', name: 'P4', order: 4 },
      { id: '18-5', name: 'P5', order: 5 },
      { id: '18-6', name: 'P6', order: 6 },
      { id: '18-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '19',
    name: 'SV/CT/NH2 RH',
    order: 19,
    processes: [
      { id: '19-1', name: 'P1', order: 1 },
      { id: '19-2', name: 'P2', order: 2 },
      { id: '19-3', name: 'P3', order: 3 },
      { id: '19-4', name: 'P4', order: 4 },
      { id: '19-5', name: 'P5', order: 5 },
      { id: '19-6', name: 'P6', order: 6 },
      { id: '19-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '20',
    name: 'ME L/R',
    order: 20,
    processes: [
      { id: '20-1', name: 'P1', order: 1 },
      { id: '20-2', name: 'P2', order: 2 },
      { id: '20-3', name: 'P3', order: 3 },
      { id: '20-4', name: 'P4', order: 4 },
      { id: '20-5', name: 'P5', order: 5 },
      { id: '20-6', name: 'P6', order: 6 },
      { id: '20-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '21',
    name: '프리미엄 A',
    order: 21,
    processes: [
      { id: '21-1', name: 'P1', order: 1 },
      { id: '21-2', name: 'P2', order: 2 },
      { id: '21-3', name: 'P3', order: 3 },
      { id: '21-4', name: 'P4', order: 4 },
      { id: '21-5', name: 'P5', order: 5 },
      { id: '21-6', name: 'P6', order: 6 },
      { id: '21-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '22',
    name: '프리미엄 B',
    order: 22,
    processes: [
      { id: '22-1', name: 'P1', order: 1 },
      { id: '22-2', name: 'P2', order: 2 },
      { id: '22-3', name: 'P3', order: 3 },
      { id: '22-4', name: 'P4', order: 4 },
      { id: '22-5', name: 'P5', order: 5 },
      { id: '22-6', name: 'P6', order: 6 },
      { id: '22-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '23',
    name: 'CMS',
    order: 23,
    processes: [
      { id: '23-1', name: 'P1', order: 1 },
      { id: '23-2', name: 'P2', order: 2 },
      { id: '23-3', name: 'P3', order: 3 },
      { id: '23-4', name: 'P4', order: 4 },
      { id: '23-5', name: 'P5', order: 5 },
      { id: '23-6', name: 'P6', order: 6 },
      { id: '23-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '24',
    name: 'ETCS',
    order: 24,
    processes: [
      { id: '24-1', name: 'P1', order: 1 },
      { id: '24-2', name: 'P2', order: 2 },
      { id: '24-3', name: 'P3', order: 3 },
      { id: '24-4', name: 'P4', order: 4 },
      { id: '24-5', name: 'P5', order: 5 },
      { id: '24-6', name: 'P6', order: 6 },
      { id: '24-7', name: 'P7', order: 7 },
    ],
  },
  {
    id: '25',
    name: '린지원',
    order: 25,
    processes: [
      { id: '25-1', name: '서열피더', order: 1 },
      { id: '25-2', name: '조립피더', order: 2 },
      { id: '25-3', name: '리워크', order: 3 },
      { id: '25-4', name: '폴리싱', order: 4 },
      { id: '25-5', name: '서열대차', order: 5 },
    ],
  },
]

/** 라인 선택 영역 */
const ProcessSetting = () => {
  const [lines, setLines] = useState(initialLines)
  const [originalLines] = useState(initialLines)
  const [selectedLineId, setSelectedLineId] = useState('1')
  const [hasChanges, setHasChanges] = useState(false)

  const selectedLine = lines.find((line) => line.id === selectedLineId)

  // 변경사항 감지
  useEffect(() => {
    setHasChanges(JSON.stringify(lines) !== JSON.stringify(originalLines))
  }, [lines, originalLines])

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // 서버에 저장하는 API 호출
      console.log('Saving changes:', lines)
      // await saveChangesToServer(lines)
      setHasChanges(false)
      alert('변경사항이 저장되었습니다.')
    } catch (error) {
      console.error('Save failed:', error)
      alert('저장에 실패했습니다.')
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
      setLines(lines.filter((line) => line.id !== lineId))
      if (selectedLineId === lineId) {
        setSelectedLineId(lines[0]?.id || '')
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
      id: Date.now().toString(),
      name: name,
      order: lines.length + 1,
      processes: [],
    }
    setLines([...lines, newLine])
    setSelectedLineId(newLine.id)
  }

  // 공정 추가 핸들러
  const handleAddProcess = (name: string) => {
    if (!selectedLine) return

    const newProcess = {
      id: Date.now().toString(),
      name: name,
      order: selectedLine.processes.length + 1,
    }

    setLines(
      lines.map((line) =>
        line.id === selectedLineId ? { ...line, processes: [...line.processes, newProcess] } : line,
      ),
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[60vh] min-h-[400px] max-h-[700px]">
            <ProcessContainer title={'라인'} />
            <div className="flex-1 overflow-y-auto">
              <DragList
                data={lines}
                selectedId={selectedLineId}
                setSelectedId={setSelectedLineId}
                onDrop={handleLineDrop}
                onDelete={handleDeleteLine}
                onAdd={handleAddLine}
                type="line"
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ProcessContainer title={'공정'} selectedLine={selectedLine?.name} />
            <div>
              {selectedLine && (
                <DragList
                  data={selectedLine.processes || []}
                  onDrop={handleProcessDrop}
                  onDelete={handleDeleteProcess}
                  onAdd={handleAddProcess}
                  type="process"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 변경사항 알림 하단 바 */}
      {hasChanges && (
        <div className="fixed top-0 left-0 right-0 bg-white border-t border-gray-200 py-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
            <p className="flex items-center text-sm ">
              저장되지 않은 변경사항이 있습니다.
              <br />
              편집이 완료되면 꼭 저장 버튼을 눌러주세요.
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
