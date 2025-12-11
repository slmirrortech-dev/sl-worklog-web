'use client'

import React, { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CustomDataGrid } from '@/components/admin/CustomDataGrid'
import useSearchUsers from '@/app/admin/(main)/users/_hooks/useSearchUsers'
import { UserResponseDto } from '@/types/user'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { Input } from '@/components/ui/input'
import ButtonLicense from '@/components/admin/ButtonLicense'
import { Button } from '@/components/ui/button'
import { ChevronRight, Search } from 'lucide-react'
import RoleLabel from '@/components/admin/RoleLabel'

interface UsersDataGridProps {
  roleFilter: 'ADMIN;MANAGER' | 'WORKER'
  id: string
  canEdit: boolean
}

const UsersDataGrid = ({ roleFilter, id, canEdit }: UsersDataGridProps) => {
  const router = useRouter()

  // 개별 상태 관리
  const { searchStates, usersQuery, page, setPage, pageSize, setPageSize, totalCount } =
    useSearchUsers(roleFilter, id)

  // URL에서 가져온 검색어로 초기화
  const [searchInput, setSearchInput] = useState(searchStates.search)

  // searchStates.search가 변경될 때 searchInput도 동기화
  useEffect(() => {
    setSearchInput(searchStates.search)
  }, [searchStates.search])

  // 테이블 컬럼 정의
  const columns: ColumnDef<UserResponseDto>[] = [
    {
      id: 'userId',
      header: '사번',
      cell: ({ row }) => <div className="text-center">{row.original.userId}</div>,
    },
    {
      id: 'name',
      header: '이름',
      cell: ({ row }) => <div className="text-center">{row.original.name}</div>,
    },
    {
      id: 'role',
      header: '역할',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <RoleLabel role={row.original.role} size="sm" />
        </div>
      ),
    },
    {
      id: 'licensePhotoUrl',
      header: '공정면허증',
      cell: ({ row }) => {
        const user = row.original as UserResponseDto
        return (
          <div className="text-center">
            <ButtonLicense targetUser={user} canEdit={canEdit} />
          </div>
        )
      },
    },
    {
      id: 'hireDate',
      header: '입사일',
      cell: ({ row }) => {
        if (!row.original.hireDate) {
          return <div className="text-center">-</div>
        } else {
          return <div className="text-center">{format(row.original.hireDate, 'yyyy-MM-dd')}</div>
        }
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-center">
            <Button
              variant="outline"
              size="default"
              onClick={(e) => {
                e.stopPropagation()
                router.push(ROUTES.ADMIN.USER_DETAIL(user.id))
              }}
            >
              상세 보기
              <ChevronRight className="w-3 h-3 -ml-1" />
            </Button>
          </div>
        )
      },
    },
  ]

  // 검색 핸들러
  const handleSearchSubmit = () => {
    searchStates.setSearch(searchInput)
    searchStates.handleSearch(searchInput)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <CustomDataGrid
        id={id}
        data={usersQuery.data?.data || []}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        loading={usersQuery.isLoading}
        setPage={setPage}
        setPageSize={setPageSize}
      >
        {/* 검색 Input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="사번 또는 이름으로 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit()
              }
            }}
            className="w-full md:max-w-xs h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            variant="outline"
            size="default"
            onClick={handleSearchSubmit}
            disabled={usersQuery.isLoading}
            className="px-3 h-10"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </CustomDataGrid>
    </div>
  )
}

export default UsersDataGrid
