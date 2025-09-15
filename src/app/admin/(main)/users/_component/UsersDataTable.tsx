'use client'

import React, { useEffect, useState } from 'react'
import { UserResponseDto } from '@/types/user'
import { getCurrentUserApi, getUsersApi } from '@/lib/api/user-api'
import { CustomDataTable } from '@/components/CustomDataTable'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import RoleLabel from '@/components/admin/RoleLabel'
import UploadForm from '@/components/admin/ButtonLicense'
import { SessionUser } from '@/lib/core/session'

/** 사용자 테이블 */
const UsersDataTable = ({
  id,
  currentUser,
  initialData,
  skip,
  take,
  totalCount,
}: {
  id: 'admins' | 'workers'
  currentUser: SessionUser
  initialData: UserResponseDto[]
  skip: number
  take: number
  totalCount: number
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 파라미터에서 상태 복원
  const getStateFromUrl = () => {
    const urlPage = searchParams.get(`${id}_page`)
    const urlPageSize = searchParams.get(`${id}_pageSize`)
    const urlSearch = searchParams.get(`${id}_search`)

    return {
      page: urlPage ? parseInt(urlPage) : skip + 1,
      pageSize: urlPageSize ? parseInt(urlPageSize) : take,
      search: urlSearch || '',
    }
  }

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [data, setData] = useState<UserResponseDto[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState(getStateFromUrl().search)
  const [page, setPage] = useState(getStateFromUrl().page)
  const [pageSize, setPageSize] = useState(getStateFromUrl().pageSize)
  const [search, setSearch] = useState(getStateFromUrl().search)

  // 사용자 목록 조회
  const fetchData = async () => {
    setLoading(true)
    try {
      const role = id === 'admins' ? 'ADMIN;MANAGER' : 'WORKER'
      const res = await getUsersApi(page, pageSize, search, role)
      setData(res.data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // URL 상태 업데이트
  const updateUrlState = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(`${id}_page`, page.toString())
    params.set(`${id}_pageSize`, pageSize.toString())
    if (search) {
      params.set(`${id}_search`, search)
    } else {
      params.delete(`${id}_search`)
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }

  // 스크롤 위치 저장
  const saveScrollPosition = () => {
    const scrollPosition = window.scrollY
    sessionStorage.setItem(`${id}_scrollPosition`, scrollPosition.toString())
    // 어떤 테이블에서 클릭했는지 기록
    sessionStorage.setItem('lastClickedTable', id)
  }

  // 스크롤 위치 복원
  const restoreScrollPosition = () => {
    const savedScrollPosition = sessionStorage.getItem(`${id}_scrollPosition`)
    const lastClickedTable = sessionStorage.getItem('lastClickedTable')

    // 마지막에 클릭한 테이블과 현재 테이블이 같을 때만 스크롤 위치 복원
    if (savedScrollPosition && lastClickedTable === id) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition))
        // 복원 후 lastClickedTable 정리
        sessionStorage.removeItem('lastClickedTable')
      }, 100)
    }
  }

  // 페이징이나 검색어가 변경되면 리패치
  useEffect(() => {
    if (!isInitialLoad) {
      fetchData().then()
      updateUrlState()
    } else {
      setIsInitialLoad(false)
      // 뒤로가기로 돌아온 경우 스크롤 위치 복원
      restoreScrollPosition()
    }
  }, [page, pageSize, search])

  // 기본 컬럼들 정의
  const baseColumns: ColumnDef<UserResponseDto>[] = [
    {
      accessorKey: 'userId',
      header: () => {
        return <div className="text-center font-semibold text-gray-700 text-base">사번</div>
      },
      cell: ({ row }: { row: any }) => (
        <div className="text-center font-mono text-sm font-medium text-gray-900">
          {row.getValue('userId')}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: () => <div className="text-center font-semibold text-gray-700 text-base">이름</div>,
      cell: ({ row }: { row: any }) => (
        <div className="text-center font-medium text-gray-900">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'role',
      header: () => <div className="text-center font-semibold text-gray-700 text-base">역할</div>,
      cell: ({ row }: { row: any }) => {
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
      cell: ({ row }: { row: any }) => {
        const user = row.original as UserResponseDto

        return (
          <div className="text-center">
            <UploadForm targetUser={user} canEdit={currentUser?.role === 'ADMIN'} />
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }: { column: any }) => (
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
      cell: ({ row }: { row: any }) => (
        <div className="text-center font-medium text-gray-500 text-base">
          {format(row.getValue('createdAt'), 'yyyy-MM-dd HH:mm:ss')}
        </div>
      ),
    },
    {
      accessorKey: 'actions',
      header: () => <div className="text-center font-semibold text-gray-700 text-base"></div>,
      cell: ({ row }: { row: any }) => {
        const user = row.original
        return (
          <div className="text-center">
            <Button
              variant="outline"
              size="default"
              onClick={() => {
                saveScrollPosition()
                router.push(`/admin/users/${user.id}`)
              }}
            >
              상세 보기
              <ChevronRight className="w-3 h-3 -ml-1" />
            </Button>
          </div>
        )
      },
    },
  ].filter(Boolean) as ColumnDef<UserResponseDto>[]

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CustomDataTable
          id={id}
          data={data}
          columns={baseColumns}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={Math.ceil(totalCount / pageSize)}
          loading={loading}
          searchInput={searchInput}
          setPage={setPage}
          setPageSize={setPageSize}
          setSearchInput={setSearchInput}
          onSearch={() => setSearch(searchInput)}
        />
      </div>
    </>
  )
}

export default UsersDataTable
