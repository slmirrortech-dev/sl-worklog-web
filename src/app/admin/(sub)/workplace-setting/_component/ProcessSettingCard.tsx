'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Save, X, Trash2, GripVertical } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ProcessItem {
  id: number
  name: string
  order: number
}

interface SortableItemProps {
  process: ProcessItem
  index: number
  onDelete: (id: number) => void
}

function SortableItem({ process, index, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: process.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm text-gray-500 font-mono w-6">{index + 1}</span>
        <span className="font-medium">{process.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(process.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function ProcessSettingCard() {
  const INITIAL_DATA: ProcessItem[] = [
    { id: 1, name: 'P1', order: 1 },
    { id: 2, name: 'P2', order: 2 },
    { id: 3, name: 'P3', order: 3 },
    { id: 4, name: 'P4', order: 4 },
    { id: 5, name: 'P5', order: 5 },
  ]

  const [originalProcesses] = useState<ProcessItem[]>(INITIAL_DATA)
  const [processes, setProcesses] = useState<ProcessItem[]>(INITIAL_DATA)
  const [newProcessName, setNewProcessName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 변경사항 감지
  const isDirty = useMemo(() => {
    if (processes.length !== originalProcesses.length) return true
    return JSON.stringify(processes) !== JSON.stringify(originalProcesses)
  }, [processes, originalProcesses])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setProcesses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        // order 재정렬
        return newItems.map((item, index) => ({ ...item, order: index + 1 }))
      })
    }
  }

  const handleAddProcess = () => {
    if (!newProcessName.trim()) return

    const newProcess: ProcessItem = {
      id: Date.now(),
      name: newProcessName.trim(),
      order: processes.length + 1,
    }
    setProcesses([...processes, newProcess])
    setNewProcessName('')
  }

  const handleDeleteProcess = (id: number) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const handleSave = () => {
    // TODO: API 호출하여 저장
    console.log('저장:', processes)
  }

  const handleCancel = () => {
    setProcesses([...originalProcesses])
    setNewProcessName('')
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">공정 설정</CardTitle>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty}
              className="gap-2"
            >
              취소
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!isDirty} className="gap-2">
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="h-full flex flex-col">
          {/* 등록된 공정 목록 (스크롤 가능) */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={processes} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 gap-2">
                  {processes.map((process, index) => (
                    <SortableItem
                      key={process.id}
                      process={process}
                      index={index}
                      onDelete={handleDeleteProcess}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* 새 공정 추가 (하단 고정) */}
          <div className="space-y-2 pt-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="추가할 공정 이름을 입력하세요"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddProcess()
                }}
                className="flex-1 h-12 !text-base"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddProcess}
                className="gap-2 shrink-0 h-12"
              >
                <Plus className="w-4 h-4" />
                추가
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
