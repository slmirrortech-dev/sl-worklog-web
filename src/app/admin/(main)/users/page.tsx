import React from 'react'
import UsersTable from '@/app/admin/(main)/users/UsersTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { redirect } from 'next/navigation'
import UsersSummary from '@/app/admin/(main)/users/UsersSummary'

const AdminUsersPage = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* 사용자 정보 */}
      <UsersSummary />
      {/* 사용자 목록 */}
      <UsersTable />
    </div>
  )
}

export default AdminUsersPage
