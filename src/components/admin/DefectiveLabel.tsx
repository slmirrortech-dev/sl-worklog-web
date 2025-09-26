import React from 'react'

const DefectiveLabel = ({ value, size }: { value: boolean; size: 'sm' | 'lg' }) => {
  const color = (value: boolean) => {
    switch (value) {
      case true:
        return 'bg-pink-100 text-pink-800 border border-pink-200'
      case false:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    }
  }

  return (
    <span
      className={`${color(value)} inline-flex items-center rounded-full ${size === 'sm' ? 'text-sm px-3 h-6.5' : 'text-base px-4 py-1.5 h-8'} font-medium`}
    >
      {value ? '불량' : '정상'}
    </span>
  )
}

export default DefectiveLabel
