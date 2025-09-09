'use client'

import React, { useEffect, useState } from 'react'
import { UserResponseDto } from '@/types/user'
import { getUsersApi } from '@/lib/api/user-api'
import { CustomDataTable } from '@/components/CustomDataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import RoleLabel from '@/components/admin/RoleLabel'

/** 사용자 테이블 */
const UsersDataTable = ({
  id,
  initialData,
  skip,
  take,
  totalCount,
}: {
  id: 'admins' | 'workers'
  initialData: UserResponseDto[]
  skip: number
  take: number
  totalCount: number
}) => {
  const router = useRouter()
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [data, setData] = useState<UserResponseDto[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(skip + 1)
  const [pageSize, setPageSize] = useState(take)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const role = id === 'admins' ? 'ADMIN;MANAGER' : 'WORKER'
      const res = await getUsersApi(page, pageSize, encodeURIComponent(search), role)
      setData(res.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isInitialLoad) {
      fetchData().then()
    } else {
      setIsInitialLoad(false)
    }
  }, [page, pageSize, search])

  // 검색 버튼 클릭 시 실제 검색 실행
  const handleSearch = () => {
    setSearch(searchInput)
  }

  // 기본 컬럼들 정의
  const baseColumns: ColumnDef<UserResponseDto>[] = [
    {
      accessorKey: 'userId',
      header: () => {
        return <div className="text-center font-semibold text-gray-700 text-base">사번</div>
      },
      cell: ({ row }) => (
        <div className="text-center font-mono text-sm font-medium text-gray-900">
          {row.getValue('userId')}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: () => <div className="text-center font-semibold text-gray-700 text-base">이름</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium text-gray-900">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: () => <div className="text-center font-semibold text-gray-700 text-base">역할</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center">
            <RoleLabel role={row.getValue('role')} size="sm" />
          </div>
        )
      },
    },
    {
      accessorKey: 'licensePhotoUrl',
      header: () => (
        <div className="text-center font-semibold text-gray-700 text-base">공정면허증</div>
      ),
      cell: ({ row }) => {
        const user = row.original as UserResponseDto
        const isLicensePhoto = row.getValue('licensePhotoUrl')

        return (
          <div className="text-center">
            {/*{isLicensePhoto ? (*/}
            {/*  <Button*/}
            {/*    variant="default"*/}
            {/*    size="sm"*/}
            {/*    onClick={(e) => {*/}
            {/*      e.stopPropagation()*/}
            {/*      handleLicensePhotoClick(user)*/}
            {/*    }}*/}
            {/*    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"*/}
            {/*  >*/}
            {/*    <FileImage className="w-3 h-3 mr-1" />*/}
            {/*    확인*/}
            {/*  </Button>*/}
            {/*) : (*/}
            {/*  <Button*/}
            {/*    variant="outline"*/}
            {/*    size="sm"*/}
            {/*    onClick={(e) => {*/}
            {/*      e.stopPropagation()*/}
            {/*      router.push(`/admin/users/${user.id}`)*/}
            {/*    }}*/}
            {/*    className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 text-sm"*/}
            {/*  >*/}
            {/*    <Plus className="w-3 h-3 mr-1" />*/}
            {/*    등록*/}
            {/*  </Button>*/}
            {/*)}*/}
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-8 px-2 text-base font-semibold text-gray-700 hover:bg-gray-100"
          >
            등록일시
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center font-medium text-gray-500 text-base">
          {format(row.getValue('createdAt'), 'yyyy-MM-dd HH:mm:ss')}
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <div className="text-center font-semibold text-gray-700 text-base"></div>
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-center">
            <Button
              variant="outline"
              size="default"
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              상세 보기
              <ChevronRight className="w-3 h-3 -ml-1" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <CustomDataTable
        id={id}
        data={data}
        columns={baseColumns}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={Math.ceil(totalCount / take)}
        loading={loading}
        searchInput={searchInput}
        setPage={setPage}
        setPageSize={setPageSize}
        setSearchInput={setSearchInput}
        onSearch={handleSearch}
      />
    </div>
  )
}

export default UsersDataTable
