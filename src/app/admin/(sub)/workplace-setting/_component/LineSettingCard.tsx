'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Save, X, GripVertical, Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

interface ClassItem {
  id: number
  name: string
}

interface LineItem {
  id: string
  name: string
  order: number
  classId: number
}

interface SortableLineItemProps {
  line: LineItem
  index: number
  classes: ClassItem[]
  onDelete: (id: string) => void
  onUpdateName: (id: string, name: string) => void
  onChangeClass: (id: string, classId: number) => void
}

function SortableLineItem({
  line,
  index,
  classes,
  onDelete,
  onUpdateName,
  onChangeClass,
}: SortableLineItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(line.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: line.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleCancelEdit()
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  const handleSaveName = () => {
    if (editName.trim() && editName !== line.name) {
      onUpdateName(line.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditName(line.name)
    setIsEditing(false)
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        containerRef.current = node
      }}
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
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName()
              if (e.key === 'Escape') handleCancelEdit()
            }}
            className="h-8 !text-base font-medium"
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <span className="font-medium">{line.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
          >
            <Pencil className="w-3 h-3" />
          </Button>
        </div>
      )}

      <Select
        value={line.classId.toString()}
        onValueChange={(value) => onChangeClass(line.id, parseInt(value))}
      >
        <SelectTrigger className="w-28 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {classes.map((classItem) => (
            <SelectItem key={classItem.id} value={classItem.id.toString()}>
              {classItem.name}반
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(line.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function LineSettingCard() {
  const CLASSES: ClassItem[] = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '서브' },
  ]

  const INITIAL_LINES: LineItem[] = [
    { id: '1', name: 'MV L/R', order: 1, classId: 1 },
    { id: '2', name: 'MV ASSY', order: 2, classId: 1 },
    { id: '3', name: 'DV L/R', order: 3, classId: 2 },
    { id: '4', name: 'DV ASSY', order: 4, classId: 2 },
    { id: '5', name: 'SUB LINE', order: 5, classId: 3 },
  ]

  const [mounted, setMounted] = useState(false)
  const [originalLines] = useState<LineItem[]>(INITIAL_LINES)
  const [lines, setLines] = useState<LineItem[]>(INITIAL_LINES)
  const [newLineName, setNewLineName] = useState('')
  const [selectedClassForNew, setSelectedClassForNew] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<string>('1')

  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // 변경사항 감지
  const isDirty = useMemo(() => {
    if (lines.length !== originalLines.length) return true
    return JSON.stringify(lines) !== JSON.stringify(originalLines)
  }, [lines, originalLines])

  // 탭별 라인 필터링
  const getLinesByClass = (classId: number) => {
    return lines.filter((line) => line.classId === classId).sort((a, b) => a.order - b.order)
  }

  const handleDragEnd = (event: DragEndEvent, classId: number) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const classLines = getLinesByClass(classId)
      const oldIndex = classLines.findIndex((item) => item.id === active.id)
      const newIndex = classLines.findIndex((item) => item.id === over.id)

      const reorderedClassLines = arrayMove(classLines, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }))

      // 다른 반의 라인은 그대로 유지하고, 현재 반의 라인만 업데이트
      setLines((prevLines) => {
        const otherLines = prevLines.filter((line) => line.classId !== classId)
        return [...otherLines, ...reorderedClassLines].sort((a, b) => {
          if (a.classId === b.classId) return a.order - b.order
          return a.classId - b.classId
        })
      })
    }
  }

  const handleAddLine = () => {
    if (!newLineName.trim()) return

    const classLines = getLinesByClass(selectedClassForNew)
    const maxOrder = classLines.length > 0 ? Math.max(...classLines.map((l) => l.order)) : 0

    const newLine: LineItem = {
      id: Date.now().toString(),
      name: newLineName.trim(),
      order: maxOrder + 1,
      classId: selectedClassForNew,
    }
    setLines([...lines, newLine])
    setNewLineName('')
  }

  const handleDeleteLine = (id: string) => {
    setLines(lines.filter((line) => line.id !== id))
  }

  const handleUpdateName = (id: string, name: string) => {
    setLines(lines.map((line) => (line.id === id ? { ...line, name } : line)))
  }

  const handleChangeClass = (id: string, newClassId: number) => {
    const line = lines.find((l) => l.id === id)
    if (!line) return

    // 새로운 반의 마지막 order 가져오기
    const newClassLines = getLinesByClass(newClassId)
    const maxOrder = newClassLines.length > 0 ? Math.max(...newClassLines.map((l) => l.order)) : 0

    setLines(
      lines.map((l) => (l.id === id ? { ...l, classId: newClassId, order: maxOrder + 1 } : l)),
    )

    // 탭도 자동으로 변경
    setActiveTab(newClassId.toString())
  }

  const handleSave = () => {
    // TODO: API 호출하여 저장
    console.log('저장:', lines)
  }

  const handleCancel = () => {
    setLines([...originalLines])
    setNewLineName('')
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">공정 설정</CardTitle>
            <CardDescription>작업 공정을 반별로 관리합니다</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty}
              className="gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="h-full flex flex-col">
          {/* 커스텀 탭 버튼 */}
          <div className="flex bg-gray-200 rounded-full p-1 w-fit mb-4">
            {CLASSES.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => setActiveTab(classItem.id.toString())}
                className={`px-6 py-1.5 rounded-full text-base font-semibold transition-all ${
                  activeTab === classItem.id.toString()
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {classItem.name}반
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          {CLASSES.map((classItem) => {
            const classLines = getLinesByClass(classItem.id)

            if (activeTab !== classItem.id.toString()) return null

            return (
              <div key={classItem.id} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {classLines.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">등록된 라인이 없습니다</div>
                  ) : mounted ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleDragEnd(e, classItem.id)}
                    >
                      <SortableContext items={classLines} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {classLines.map((line, index) => (
                            <SortableLineItem
                              key={line.id}
                              line={line}
                              index={index}
                              classes={CLASSES}
                              onDelete={handleDeleteLine}
                              onUpdateName={handleUpdateName}
                              onChangeClass={handleChangeClass}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="space-y-2">
                      {classLines.map((line, index) => (
                        <div
                          key={line.id}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <span className="text-sm text-gray-500 font-mono w-6">{index + 1}</span>
                          <span className="font-medium flex-1">{line.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 새 라인 추가 (하단 고정) */}
        <div className="space-y-2 pt-4 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Select
              value={selectedClassForNew.toString()}
              onValueChange={(value) => setSelectedClassForNew(parseInt(value))}
            >
              <SelectTrigger className="w-32 !h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id.toString()}>
                    {classItem.name}반
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="추가할 공정 이름을 입력하세요"
              value={newLineName}
              onChange={(e) => setNewLineName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddLine()
              }}
              className="flex-1 h-12 !text-base"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddLine}
              className="gap-2 shrink-0 h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <Plus className="w-4 h-4" />
              추가
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
