import React from 'react'
import { leftTableHead } from '@/app/admin/(main)/setting-line/_component/SettingProcess'
import { GripVertical, X } from 'lucide-react'

const ProcessCell = ({ line, process, isEditMode, dragAndDropControl, editLineControl }: any) => {
  const { isDragging, dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    dragAndDropControl

  return (
    <div
      className={`${leftTableHead} px-2 py-1`}
      draggable={isEditMode}
      onDragStart={isEditMode ? (e) => handleDragStart(e, process, 'process', line.id) : undefined}
      onDrop={isEditMode ? (e) => handleDrop(e, process, 'process', line.id) : undefined}
      onDragOver={isEditMode ? handleDragOver : undefined}
      onDragEnd={isEditMode ? handleDragEnd : undefined}
    >
      <div
        className={`group px-3 py-2 rounded-lg border shadow-sm flex h-full items-center justify-between ${isEditMode ? 'cursor-move' : ''} transition-all duration-300 ${
          isDragging &&
          dragState.draggedType === 'process' &&
          dragState.draggedItem?.id === process.id
            ? 'bg-blue-200 border-blue-400 opacity-70 scale-95'
            : isDragging &&
                dragState.draggedType === 'process' &&
                dragState.draggedLineId === line.id
              ? `bg-blue-100 border-blue-300 ${isEditMode && 'hover:bg-blue-200'}`
              : `bg-blue-500 border-blue-600  ${isEditMode && 'hover:bg-blue-600'} hover:shadow-md text-white`
        }`}
      >
        {isEditMode && <GripVertical className="w-4 h-4 text-white flex-shrink-0" />}
        <div className="flex-1 flex justify-center">
          {editLineControl.editingProcess === process.id ? (
            <input
              type="text"
              value={editLineControl.editValue}
              onChange={(e) => editLineControl.setEditValue(e.target.value)}
              onKeyDown={editLineControl.handleKeyDown}
              onBlur={editLineControl.handleSaveProcessEdit}
              className="text-gray-700 font-semibold text-sm bg-white border border-blue-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-16 text-center"
              autoFocus
            />
          ) : (
            <span
              className={`text-white font-semibold text-sm ${
                isEditMode ? 'cursor-pointer hover:text-blue-100 hover:underline' : ''
              }`}
              onClick={
                isEditMode
                  ? () => editLineControl.handleStartEditProcess(process.id, process.name)
                  : undefined
              }
            >
              {process.name}
            </span>
          )}
        </div>
        {isEditMode && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              editLineControl.handleDeleteProcess(line.id, process.id)
            }}
            title="공정 삭제"
            className="text-white hover:text-red-300 hover:bg-red-500/20 rounded-full p-1 flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  )
}

export default ProcessCell
