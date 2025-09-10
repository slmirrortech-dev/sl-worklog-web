import React from 'react'
import UsersSummary from '@/app/admin/(main)/users/_component/UsersSummary'
import { UserResponseDto } from '@/types/user'
import prisma from '@/lib/core/prisma'
import UsersDataTable from '@/app/admin/(main)/users/_component/UsersDataTable'

const INITIAL_SKIP = 0
const INITIAL_TAKE = 10

/** 사용자 관리 페이지 */
const AdminUsersPage = async () => {
  // 총 데이터 수
  const totalCount = await prisma.user.count({ where: { isActive: true } })
  const adminTotalCount = await prisma.user.count({
    where: { isActive: true, role: 'ADMIN' },
  })
  const managerTotalCount = await prisma.user.count({
    where: { isActive: true, role: 'MANAGER' },
  })
  const workerTotalCount = await prisma.user.count({ where: { isActive: true, role: 'WORKER' } })

  const admins = (await prisma.user.findMany({
    where: { isActive: true, role: { in: ['ADMIN', 'MANAGER'] } },
    select: {
      id: true,
      userId: true,
      name: true,
      birthday: true,
      role: true,
      isInitialPasswordChanged: true,
      licensePhotoUrl: true,
      isActive: true,
      deactivatedAt: true,
      createdAt: true,
    },
    skip: INITIAL_SKIP,
    take: INITIAL_TAKE,
    orderBy: [{ createdAt: 'desc' }],
  })) as UserResponseDto[]

  const workers = (await prisma.user.findMany({
    where: { isActive: true, role: 'WORKER' },
    select: {
      id: true,
      userId: true,
      name: true,
      birthday: true,
      role: true,
      isInitialPasswordChanged: true,
      licensePhotoUrl: true,
      isActive: true,
      deactivatedAt: true,
      createdAt: true,
    },
    skip: INITIAL_SKIP,
    take: INITIAL_TAKE,
    orderBy: [{ createdAt: 'desc' }, { userId: 'desc' }, { name: 'asc' }],
  })) as UserResponseDto[]

  return (
    <div className="flex flex-col space-y-6">
      {/* 사용자 정보 */}
      <UsersSummary
        totalCount={totalCount}
        adminTotalCount={adminTotalCount}
        managerTotalCount={managerTotalCount}
        workerTotalCount={workerTotalCount}
      />
      <div className="space-y-4">
        <h2 className="text-xl font-bold">관리자 목록</h2>
        {/* 관리자 목록 */}
        <UsersDataTable
          id="admins"
          initialData={admins}
          skip={INITIAL_SKIP}
          take={INITIAL_TAKE}
          totalCount={adminTotalCount + managerTotalCount}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">작업자 목록</h2>
        {/* 사용자 목록 */}
        <UsersDataTable
          id="workers"
          initialData={workers}
          skip={INITIAL_SKIP}
          take={INITIAL_TAKE}
          totalCount={workerTotalCount}
        />
      </div>
    </div>
  )
}

export default AdminUsersPage
