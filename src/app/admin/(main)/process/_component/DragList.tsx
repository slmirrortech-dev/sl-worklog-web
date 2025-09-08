import React, { useState } from 'react'
import { Edit, Factory, GripVertical, Plus, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DragListItem {
  id: string
  name: string
  processes?: any[]
  order?: number
}

interface DragListProps {
  data: DragListItem[]
  selectedId?: string
  setSelectedId?: (id: string) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDelete?: (id: string) => void
  onAdd?: (name: string) => void
  onEdit?: (id: string, name: string) => void
  type?: 'line' | 'process'
}

const DragList = ({
  data,
  selectedId,
  setSelectedId,
  onDrop,
  onDelete,
  onAdd,
  onEdit,
  type = 'line',
}: DragListProps) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = () => {
    if (!newItemName.trim() || !onAdd) return

    onAdd(newItemName)
    setNewItemName('')
    setIsAdding(false)
  }

  const handleEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleSaveEdit = () => {
    if (!editingName.trim() || !onEdit || !editingId) return

    onEdit(editingId, editingName)
    setEditingId(null)
    setEditingName('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {data.map((item, index) => {
        const isSelected = selectedId === item.id
        return (
          <div
            key={item.id}
            className={`p-3 rounded-lg transition-colors flex items-center justify-between group border ${
              editingId === item.id
                ? 'border-2 border-blue-300 bg-blue-50'
                : isSelected
                  ? 'bg-blue-100 border-blue-200 cursor-pointer'
                  : 'hover:bg-gray-50 cursor-pointer'
            }`}
            draggable={editingId !== item.id}
            onClick={() => editingId !== item.id && setSelectedId?.(item.id)}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', index.toString())
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, index)}
          >
            {editingId === item.id ? (
              <div className="flex items-center gap-2 w-full">
                {type === 'process' ? (
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                ) : (
                  <Factory className="w-4 h-4 text-blue-600" />
                )}
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                  className="flex-1 h-8 border-none text-base shadow-none font-medium"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit} className="h-8 px-2">
                  확인
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 px-2">
                  취소
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center flex-1 gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  {type === 'process' ? (
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                  ) : (
                    <Factory className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {item.name}
                  </span>
                  {type === 'line' && (
                    <span className="text-sm text-gray-500">
                      ({item.processes?.length || 0}개 공정)
                    </span>
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <Button
                    title="수정"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(item.id, item.name)
                    }}
                    className={`h-7 w-7 p-0 text-gray-500 hover:text-gray-700`}
                  >
                    <Edit className={'w-4 h-4'} />
                  </Button>
                  <Button
                    title="삭제"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(item.id)
                    }}
                    className={`'h-8 w-8' p-0 text-red-500 hover:text-red-700`}
                  >
                    <Trash2 className={`'w-4 h-4'`} />
                  </Button>
                </div>
              </>
            )}
          </div>
        )
      })}

      {/* 인라인 항목 추가 */}
      {onAdd && (
        <>
          {isAdding ? (
            <div className={`p-3 rounded-lg border-2 border-dashed border-green-300 bg-green-50`}>
              <div className="flex items-center gap-2">
                {type === 'process' ? (
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    {data.length + 1}
                  </div>
                ) : (
                  <Factory className={`w-4 h-4 text-green-600`} />
                )}
                <Input
                  placeholder={`${type === 'line' ? '라인' : '공정'} 이름을 입력하세요`}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd()
                    if (e.key === 'Escape') setIsAdding(false)
                  }}
                  className={`flex-1 h-8 border-none text-base md:text-base shadow-none placeholder:text-base`}
                  autoFocus
                />
                <Button size="sm" onClick={handleAdd} className="h-8 px-2">
                  추가
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setNewItemName('')
                  }}
                  className="h-8 px-2"
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className={`w-full p-3.5 h-auto border-2 border-dashed border-gray-300 text-base hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-600`}
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />새 {type === 'line' ? '라인' : '공정'} 추가
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default DragList
