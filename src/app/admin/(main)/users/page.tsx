import React from 'react'
import UsersSummary from '@/app/admin/(main)/users/_component/UsersSummary'
import UsersDataGrid from '@/app/admin/(main)/users/_component/UsersDataGrid'

/** 사용자 관리 페이지 */
const AdminUsersPage = () => {
  return (
    <div className="flex flex-col space-y-6 mb-24">
      {/* 사용자 정보 */}
      <UsersSummary />

      {/* 관리자 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">관리자 목록</h2>
        <UsersDataGrid roleFilter="ADMIN;MANAGER" id="admins" />
      </div>

      {/* 작업자 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">작업자 목록</h2>
        <UsersDataGrid roleFilter="WORKER" id="workers" />
      </div>
    </div>
  )
}

export default AdminUsersPage
