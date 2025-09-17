import React, { useEffect, useState } from 'react'
import { leftTableHead } from '@/app/admin/(main)/setting-line/_component/SettingProcess'
import { GripVertical, X } from 'lucide-react'
import { updateLineStatusApi } from '@/lib/api/line-status-api'

const EditableLineCell = ({
  line,
  editLineControl,
  isEditMode,
  dragAndDropControl,
  setSaveProgress,
}: any) => {
  const { isDragging, dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    dragAndDropControl

  const {
    editingLine,
    editValue,
    setEditValue,
    handleKeyDown,
    handleSaveLineEdit,
    handleStartEditLine,
    handleDeleteLine,
  } = editLineControl
  const [classNo, setClassNo] = useState<number>(1)

  useEffect(() => {
    setClassNo(line.classNo)
  }, [line])

  const handleClassNoChange = async (newClassNo: number) => {
    setClassNo(newClassNo)
    setSaveProgress(10)
    try {
      await updateLineStatusApi(line.id, undefined, undefined, newClassNo)
      setSaveProgress(15)
    } catch (error) {
      console.error('반 변경 실패:', error)
      setClassNo(line.classNo)
      setSaveProgress(0)
    }
  }

  return (
    <td className="sticky left-0 z-10">
      <div
        className={`group flex flex-col justify-center ${leftTableHead} px-4 ${isEditMode ? 'cursor-move' : ''} transition-all duration-300 ${
          isDragging && dragState.draggedType === 'line' && dragState.draggedItem?.id === line.id
            ? 'bg-blue-50 border-l-4 border-blue-400 opacity-70 scale-98'
            : isDragging && dragState.draggedType === 'line'
              ? `bg-blue-50 border-l-4 border-blue-300 ${isEditMode && 'hover:bg-blue-100'}`
              : `bg-white border-l-4 border-blue-500 ${isEditMode && 'hover:bg-blue-50'}`
        }`}
        draggable={isEditMode}
        onDragStart={isEditMode ? (e) => handleDragStart(e, line, 'line') : undefined}
        onDrop={isEditMode ? (e) => handleDrop(e, line, 'line') : undefined}
        onDragOver={isEditMode ? handleDragOver : undefined}
        onDragEnd={isEditMode ? handleDragEnd : undefined}
      >
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            {isEditMode && <GripVertical className="w-4 h-4 text-gray-400" />}
            {editingLine === line.id ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveLineEdit}
                className="text-lg font-semibold text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[120px]"
                autoFocus
              />
            ) : (
              <span
                className={`text-lg font-semibold text-gray-800 ${
                  isEditMode ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''
                }`}
                onClick={isEditMode ? () => handleStartEditLine(line.id, line.name) : undefined}
              >
                {line.name}
              </span>
            )}
          </div>
          {isEditMode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteLine(line.id)
              }}
              title="라인 삭제"
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isEditMode && <div className="w-4"></div>}
          <select
            id={line.id}
            value={classNo}
            onChange={(e) => handleClassNoChange(Number(e.target.value))}
            className="-ml-1 border-none outline-none bg-transparent cursor-pointer text-gray-500 font-medium"
          >
            <option value={1}>1반</option>
            <option value={2}>2반</option>
          </select>
        </div>
      </div>
    </td>
  )
}

export default EditableLineCell
