'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, GripVertical, Factory } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProcessSetting from '@/app/admin/(main)/process/ProcessSetting'

// 임시 데이터
const initialLines = [
  {
    id: '1',
    name: 'A 라인',
    processes: [
      { id: '1-1', name: '절단', order: 1 },
      { id: '1-2', name: '가공', order: 2 },
      { id: '1-3', name: '도장', order: 3 },
    ],
  },
  {
    id: '2',
    name: 'B 라인',
    processes: [
      { id: '2-1', name: '준비', order: 1 },
      { id: '2-2', name: '완료', order: 2 },
    ],
  },
]

const ProcessPage = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">작업장 설정</h1>
            <p className="text-gray-600 mt-2">
              라인과 공정을 관리하여 작업자 앱에서 선택할 수 있도록 설정하세요.
            </p>
          </div>
        </div>
      </div>

      {/* 작업장 설정 */}
      <ProcessSetting />
    </div>
  )
}

export default ProcessPage
