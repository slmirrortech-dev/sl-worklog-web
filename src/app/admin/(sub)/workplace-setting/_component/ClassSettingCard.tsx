'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Save, X, GripVertical, Pencil } from 'lucide-react'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getWorkClassesApi, updateWorkClassApi } from '@/lib/api/workplace-api'
import { WorkClassResponseDto } from '@/types/workplace'
import { useLoading } from '@/contexts/LoadingContext'
import useDialogStore from '@/store/useDialogStore'

type ClassItem = WorkClassResponseDto

interface SortableItemProps {
  classItem: ClassItem
  index: number
  disabled: boolean
  onDelete: (id: string) => void
  onUpdateName: (id: string, name: string) => void
}

function SortableItem({ classItem, index, disabled, onDelete, onUpdateName }: SortableItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(classItem.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: classItem.id,
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
        handleSaveName()
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, editName, classItem.name])

  const handleSaveName = () => {
    if (editName.trim() && editName !== classItem.name) {
      onUpdateName(classItem.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditName(classItem.name)
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
        disabled={disabled}
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
            onBlur={handleSaveName}
            className="h-8 !text-base font-medium"
            autoFocus
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <span className="font-medium">{classItem.name}</span>
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

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onDelete(classItem.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default function ClassSettingCard() {
  const queryClient = useQueryClient()
  const { showDialog } = useDialogStore()
  const { showLoading, hideLoading } = useLoading()

  const [mounted, setMounted] = useState(false)
  const [originalClasses, setOriginalClasses] = useState<ClassItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [newClassName, setNewClassName] = useState('')

  // api 호출
  const { data, refetch } = useQuery({
    queryKey: ['getWorkClassesApi'],
    queryFn: getWorkClassesApi,
    select: (response) => {
      return response.data
    },
  })

  const { mutate } = useMutation({
    mutationFn: updateWorkClassApi,
    onSuccess: () => {
      refetch()
      showDialog({
        type: 'success',
        title: '저장 완료',
        description: '반 정보가 저장되었습니다.',
        confirmText: '확인',
      })
    },
    onSettled: () => {
      hideLoading()
    },
  })

  useEffect(() => {
    if (data) {
      setOriginalClasses(data)
      setClasses(data)
    }
  }, [data])

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
    if (classes.length !== originalClasses.length) return true
    return JSON.stringify(classes) !== JSON.stringify(originalClasses)
  }, [classes, originalClasses])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setClasses((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        // 순서 재정렬
        return newItems.map((item, index) => ({ ...item, displayOrder: index + 1 }))
      })
    }
  }

  const handleAddClass = () => {
    if (!newClassName.trim()) return

    const newClass: ClassItem = {
      id: `temp_${Date.now()}`,
      name: newClassName.trim(),
      displayOrder: classes.length + 1,
    }
    setClasses([...classes, newClass])
    setNewClassName('')
  }

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter((c) => c.id !== id))
  }

  const handleUpdateName = (id: string, name: string) => {
    setClasses(classes.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  const handleSave = () => {
    // 로딩 스피너
    showLoading()

    mutate(classes)
  }

  const handleCancel = () => {
    setClasses([...originalClasses])
    setNewClassName('')
  }

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-lg h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">반 설정</CardTitle>
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
            {/* 등록된 반 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {mounted ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={classes} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {classes.map((classItem, index) => (
                        <SortableItem
                          key={classItem.id}
                          classItem={classItem}
                          index={index}
                          disabled={classes.length <= 1}
                          onDelete={() => handleDeleteClass(classItem.id)}
                          onUpdateName={handleUpdateName}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="space-y-2">
                  {classes.map((classItem, index) => (
                    <div
                      key={classItem.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-sm text-gray-500 font-mono w-6">{index + 1}</span>
                      <span className="font-medium flex-1">{classItem.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 새 반 추가 (하단 고정) */}
            <div className="space-y-2 pt-4 border-t flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  placeholder="추가할 반 이름을 입력하세요"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault()
                      handleAddClass()
                    }
                  }}
                  className="flex-1 h-12 !text-base"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddClass}
                  className="gap-2 shrink-0 h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/*{deleteTargetId && (*/}
      {/*  <CustomConfirmDialog*/}
      {/*    isOpen={isConfirmDialogOpen}*/}
      {/*    setIsOpen={setIsConfirmDialogOpen}*/}
      {/*    isLoading={false}*/}
      {/*    title="반을 삭제하시겠습니까?"*/}
      {/*    desc={`이 작업은 저장 버튼 클릭 후 최종 반영되며 복구할 수 없습니다.\n삭제 시 해당 반의 하위 데이터가 모두 함께 삭제됩니다.\n(라인 및 공정 설정, 작업자 배치 정보)`}*/}
      {/*    btnCancel={{ btnText: '취소' }}*/}
      {/*    btnConfirm={{ btnText: '확인', fn: () => handleDeleteClass(deleteTargetId) }}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  )
}
