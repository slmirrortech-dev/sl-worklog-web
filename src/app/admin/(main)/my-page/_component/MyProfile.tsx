import React from 'react'
import { Shield } from 'lucide-react'
import { CurrentUserModel } from '@/types/user'

const MyProfile = ({ currentUser }: { currentUser: CurrentUserModel }) => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">사번</label>
          <div className="text-lg font-mono text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
            {currentUser.userId}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <div className="text-lg text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
            {currentUser.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-base font-medium ${currentUser.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-orange-100 text-orange-800 border border-orange-200'}`}
          >
            <Shield className="w-4 h-4 mr-1" />
            {currentUser.role === 'ADMIN' ? '관리자' : '작업반장'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
