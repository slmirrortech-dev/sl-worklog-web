import React from 'react'
import { leftTableHead } from '@/app/admin/(main)/old-setting-line/_component/SettingProcess'
import { Plus } from 'lucide-react'
import { ButtonProps } from 'react-day-picker'

const ButtonAddProcess = ({ onClick }: ButtonProps) => {
  return (
    <div className={`${leftTableHead} px-2 py-1`}>
      <button
        onClick={onClick}
        className="group flex items-center justify-center gap-2 w-full h-full bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-gray-500 hover:text-gray-600 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">공정 추가</span>
      </button>
    </div>
  )
}

export default ButtonAddProcess
