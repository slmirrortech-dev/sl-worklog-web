import React from 'react'

const LineTable = ({ children, isDragging, isEditMode }: any) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${
        isEditMode ? 'border-blue-200 ring-4 ring-blue-100' : 'border-gray-200'
      } ${isDragging ? 'ring-2 ring-gray-300 shadow-md' : 'hover:shadow-md'}`}
    >
      <div className="overflow-auto">
        <table className="w-full border-collapse">{children}</table>
      </div>
    </div>
  )
}

export default LineTable
