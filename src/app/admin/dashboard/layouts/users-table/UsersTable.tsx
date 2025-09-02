'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, FileImage, ArrowUpDown, X, Eye, ChevronRight } from 'lucide-react'
import { CustomDataTable } from '@/components/CustomDataTable'
import { TUser } from '@/types/TUser'
import { format } from 'date-fns'

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

  // 면허증 모달 상태
  const [selectedLicensePhoto, setSelectedLicensePhoto] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>('')

  // 모바일 화면 감지
  const [isMobile, setIsMobile] = useState(false)

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 면허증 이미지 클릭 핸들러
  const handleLicensePhotoClick = (user: TUser) => {
    if (user.licensePhoto) {
      setSelectedLicensePhoto(user.licensePhoto)
      setSelectedUserName(user.name)
    }
  }

  // 모달 닫기
  const closeModal = () => {
    setSelectedLicensePhoto(null)
    setSelectedUserName('')
  }

  const actionsColumn: ColumnDef<TUser> = {
    id: 'actions',
    header: () => <div className="text-center font-semibold text-gray-700 text-base"></div>,
    cell: ({ row }) => {
      const user = row.original as TUser
      return (
        <div className="text-right">
          <Button
            variant="link"
            size="sm"
            onClick={() => router.push(`/admin/dashboard/user/${user.id}`)}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 text-sm"
          >
            상세 보기
            <ChevronRight className="w-3 h-3 -ml-1" />
          </Button>
        </div>
      )
    },
  }

  // 기본 컬럼들 정의
  const baseColumns: ColumnDef<TUser>[] = [
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
        const user = row.original as TUser
        const isLicensePhoto = row.getValue('licensePhoto')

        return (
          <div className="text-center">
            {isLicensePhoto ? (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLicensePhotoClick(user)
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
                  router.push(`/admin/dashboard/user/${user.id}`)
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

  // 반응형 컬럼 배열 생성
  const columns = React.useMemo(() => {
    if (isMobile) {
      // 모바일: 상세보기 컬럼을 맨 앞에
      return [actionsColumn, ...baseColumns]
    } else {
      // 데스크톱: 상세보기 컬럼을 맨 뒤에
      return [...baseColumns, actionsColumn]
    }
  }, [isMobile])

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

  // 검색 버튼 클릭 시 실제 검색 실행
  const handleSearch = () => {
    setSearch(searchInput)
  }

  return (
    <>
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
                onClick={() => router.push('/admin/dashboard/users/new')}
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

      {/* 면허증 이미지 모달 */}
      {selectedLicensePhoto && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedUserName}님의 공정면허증
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="p-6 flex items-center justify-center">
              <img
                src={selectedLicensePhoto}
                alt={`${selectedUserName}님의 공정면허증`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UsersTable
