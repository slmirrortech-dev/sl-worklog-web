'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Save, X, Trash2, GripVertical, Pencil, Check } from 'lucide-react'
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

interface LineSupportItem {
  id: string
  name: string
  order: number
}

interface SortableLineSupportItemProps {
  lineSupport: LineSupportItem
  index: number
  onDelete: (id: string) => void
  onUpdateName: (id: string, name: string) => void
}

function SortableLineSupportItem({
  lineSupport,
  index,
  onDelete,
  onUpdateName,
}: SortableLineSupportItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(lineSupport.name)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lineSupport.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSaveName = () => {
    if (editName.trim() && editName !== lineSupport.name) {
      onUpdateName(lineSupport.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditName(lineSupport.name)
    setIsEditing(false)
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

      <span className="text-sm text-gray-500 font-mono w-6">{index + 1}</span>

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName()
              if (e.key === 'Escape') handleCancelEdit()
            }}
            className="h-8 flex-1"
            autoFocus
          />
          <Button variant="ghost" size="sm" onClick={handleSaveName} className="h-8 px-2">
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-8 px-2">
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <span className="font-medium">{lineSupport.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 px-2 text-gray-400 hover:text-gray-600"
          >
            <Pencil className="w-3 h-3" />
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(lineSupport.id)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function LineSupportSettingCard() {
  const INITIAL_LINE_SUPPORTS: LineSupportItem[] = [
    { id: '1', name: '서열피더', order: 1 },
    { id: '2', name: '조립피더', order: 2 },
    { id: '3', name: '린지원', order: 3 },
  ]

  const [originalLineSupports] = useState<LineSupportItem[]>(INITIAL_LINE_SUPPORTS)
  const [lineSupports, setLineSupports] = useState<LineSupportItem[]>(INITIAL_LINE_SUPPORTS)
  const [newLineSupportName, setNewLineSupportName] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 변경사항 감지
  const isDirty = useMemo(() => {
    if (lineSupports.length !== originalLineSupports.length) return true
    return JSON.stringify(lineSupports) !== JSON.stringify(originalLineSupports)
  }, [lineSupports, originalLineSupports])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLineSupports((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        // order 재정렬
        return newItems.map((item, index) => ({ ...item, order: index + 1 }))
      })
    }
  }

  const handleAddLineSupport = () => {
    if (!newLineSupportName.trim()) return

    const maxOrder = lineSupports.length > 0 ? Math.max(...lineSupports.map((ls) => ls.order)) : 0

    const newLineSupport: LineSupportItem = {
      id: Date.now().toString(),
      name: newLineSupportName.trim(),
      order: maxOrder + 1,
    }
    setLineSupports([...lineSupports, newLineSupport])
    setNewLineSupportName('')
  }

  const handleDeleteLineSupport = (id: string) => {
    setLineSupports(lineSupports.filter((ls) => ls.id !== id))
  }

  const handleUpdateName = (id: string, name: string) => {
    setLineSupports(lineSupports.map((ls) => (ls.id === id ? { ...ls, name } : ls)))
  }

  const handleSave = () => {
    // TODO: API 호출하여 저장
    console.log('저장:', lineSupports)
  }

  const handleCancel = () => {
    setLineSupports([...originalLineSupports])
    setNewLineSupportName('')
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              린지원 설정
            </CardTitle>
            <CardDescription>모든 반에 일괄 적용됩니다</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty}
              className="gap-2"
            >
              <X className="w-4 h-4" />
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
          {/* 등록된 린지원 목록 */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {lineSupports.length === 0 ? (
              <div className="text-center py-8 text-gray-400">등록된 린지원이 없습니다.</div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={lineSupports} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {lineSupports.map((lineSupport, index) => (
                      <SortableLineSupportItem
                        key={lineSupport.id}
                        lineSupport={lineSupport}
                        index={index}
                        onDelete={handleDeleteLineSupport}
                        onUpdateName={handleUpdateName}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* 새 린지원 추가 (하단 고정) */}
          <div className="space-y-2 pt-4 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="추가할 린지원 이름을 입력하세요"
                value={newLineSupportName}
                onChange={(e) => setNewLineSupportName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddLineSupport()
                }}
                className="flex-1 h-12 !text-base"
              />
              <Button onClick={handleAddLineSupport} className="gap-2 shrink-0 h-12">
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
