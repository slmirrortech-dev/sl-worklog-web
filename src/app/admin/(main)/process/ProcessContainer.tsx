import React from 'react'

const ProcessContainer = ({
  title = '이름',
  selectedLine = '',
}: {
  title: string
  selectedLine?: string
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          {selectedLine && <strong>{selectedLine} </strong>}
          {title} 목록
        </h2>
        <span className="text-sm text-gray-500">드래그하여 순서 변경</span>
      </div>
    </div>
  )
}

export default ProcessContainer
