'use client'

import React, { useEffect, useState } from 'react'
import UsersSummary from '@/app/admin/(main)/users/_component/UsersSummary'
import UsersDataGrid from '@/app/admin/(main)/users/_component/UsersDataGrid'
import { getCurrentUserApi, getUsersApi } from '@/lib/api/user-api'

/** 사용자 관리 페이지 */
const AdminUsersPage = () => {
  const [totalCount, setTotalCount] = useState(0)
  const [adminTotalCount, setAdminTotalCount] = useState(0)
  const [managerTotalCount, setManagerTotalCount] = useState(0)
  const [workerTotalCount, setWorkerTotalCount] = useState(0)
  const [canEdit, setCanEdit] = useState(false)

  // 전체 통계 및 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 현재 사용자 정보
        const currentUserResponse = await getCurrentUserApi()
        setCanEdit(currentUserResponse.data.role === 'ADMIN')

        // 전체 직원 수
        const allResponse = await getUsersApi({ page: 1, pageSize: 1 })
        setTotalCount(allResponse.data.totalCount)

        // 관리자 수
        const adminResponse = await getUsersApi({ page: 1, pageSize: 1, role: 'ADMIN' })
        setAdminTotalCount(adminResponse.data.totalCount)

        // 반장 수
        const managerResponse = await getUsersApi({ page: 1, pageSize: 1, role: 'MANAGER' })
        setManagerTotalCount(managerResponse.data.totalCount)

        // 작업자 수
        const workerResponse = await getUsersApi({ page: 1, pageSize: 1, role: 'WORKER' })
        setWorkerTotalCount(workerResponse.data.totalCount)
      } catch (error) {
        console.error('통계 데이터 가져오기 실패:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex flex-col space-y-6 mb-24">
      {/* 사용자 정보 */}
      <UsersSummary
        totalCount={totalCount}
        adminTotalCount={adminTotalCount}
        managerTotalCount={managerTotalCount}
        workerTotalCount={workerTotalCount}
      />

      {/* 관리자 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">관리자 목록</h2>
        <UsersDataGrid roleFilter="ADMIN;MANAGER" id="admins" canEdit={canEdit} />
      </div>

      {/* 작업자 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">작업자 목록</h2>
        <UsersDataGrid roleFilter="WORKER" id="workers" canEdit={canEdit} />
      </div>
    </div>
  )
}

export default AdminUsersPage
