'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, FileImage, ArrowUpDown } from 'lucide-react'
import { CustomDataTable } from '@/components/CustomDataTable'
import { TUser } from '@/types/TUser'
import { format } from 'date-fns'

export const columns: ColumnDef<TUser>[] = [
  {
    accessorKey: 'loginId',
    header: () => {
      return <div className="text-center font-semibold text-gray-700 text-base">사번</div>
    },
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm font-medium text-gray-900">
        {row.getValue('loginId')}
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
      const role = row.getValue('role') as 'ADMIN' | 'WORKER'
      const roleText = role === 'ADMIN' ? '관리자' : '작업자'

      return (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              role === 'ADMIN'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}
          >
            {roleText}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'licensePhoto',
    header: () => (
      <div className="text-center font-semibold text-gray-700 text-base">공정면허증</div>
    ),
    cell: ({ row }) => {
      const isLicensePhoto = row.getValue('licensePhoto')

      return (
        <div className="text-center">
          {isLicensePhoto ? (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                alert('업로드 된 이미지')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
            >
              <FileImage className="w-3 h-3 mr-1" />
              확인
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                alert('이미지 선택하기')
              }}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 text-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              등록
            </Button>
          )}
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
]

/**
 * 사용자 목록 화면
 **/
const UsersTable = () => {
  const router = useRouter()

  const [users, setUsers] = useState<TUser[]>([])
  const [loading, setLoading] = useState(true)
  const [_error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    setPage(1)
  }, [pageSize, search])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        const searchQuery = search ? `&search=${encodeURIComponent(search)}` : ''
        const response = await fetch(`/api/users?page=${page}&pageSize=${pageSize}${searchQuery}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          setError(`HTTP error! status: ${response.status}`)
          return
        }

        const responseData = await response.json()

        if (responseData.success) {
          setUsers(responseData.data)
          setTotalCount(responseData.totalCount)
          setTotalPages(responseData.totalPages)
        } else {
          setError(responseData.error || '사용자 목록을 불러오는데 실패했습니다.')
          return
        }
      } catch (_error: unknown) {
        console.error('fetch failed', _error)
        setError(_error instanceof Error ? _error.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, pageSize, search])

  // 관리자를 상단에 표시하기 위한 데이터 정렬
  const sortedData = React.useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1
      return 0
    })
  }, [users])

  // 행 클릭 시 상세보기 페이지로 이동
  const handleRowClick = (user: TUser) => {
    router.push(`/admin/dashboard/user/${user.id}`)
  }

  // 검색 버튼 클릭 시 실제 검색 실행
  const handleSearch = () => {
    setSearch(searchInput)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">전체 직원 목록</h2>
            <div className="flex items-center gap-4 mt-2 text-base text-gray-500">
              <span className="whitespace-nowrap">총 {totalCount}명</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="default"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 font-medium shadow-sm text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              신규 등록
            </Button>
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CustomDataTable
          data={sortedData}
          columns={columns}
          onRowClick={handleRowClick}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          loading={loading}
          searchInput={searchInput}
          setPage={setPage}
          setPageSize={setPageSize}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
        />
      </div>
    </div>
  )
}

export default UsersTable
