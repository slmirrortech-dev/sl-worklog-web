import React from 'react'
import { Plus } from 'lucide-react'
import { ButtonProps } from 'react-day-picker'

const ButtonAddLine = ({ onClick }: ButtonProps) => {
  return (
    <tr>
      <td className="sticky left-0 z-10">
        <div className="flex justify-center items-center min-h-[58px] pl-2 bg-gray-50">
          <button
            onClick={onClick}
            className="w-full group flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-gray-500 hover:text-gray-600 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">라인 추가</span>
          </button>
        </div>
      </td>
      <td className="bg-gray-50"></td>
    </tr>
  )
}

export default ButtonAddLine
