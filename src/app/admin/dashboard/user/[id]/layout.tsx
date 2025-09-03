import React from 'react'
import SubHeader from '@/components/admin/SubHeader'

const UserDetailLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubHeader title="직원 상세정보" />
      {children}
    </div>
  )
}

export default UserDetailLayout
