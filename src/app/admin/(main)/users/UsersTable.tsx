'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Plus, FileImage, ArrowUpDown, ChevronRight } from 'lucide-react'
import { CustomDataTable } from '@/components/CustomDataTable'
import { TUser } from '@/types/TUser'
import { format } from 'date-fns'
import useLicenseUploader from '@/app/hooks/useLicenseUploader'
import LicenseModal from '@/components/admin/LicenseModal'

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserName, setSelectedUserName] = useState<string>('')
  const [showLicenseModal, setShowLicenseModal] = useState(false)

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

  // useLicenseUploader 훅 - 선택된 사용자용
  const { licenseUrl, imageLoading, imageError, retryFetchUrl } = useLicenseUploader(
    selectedUserId || undefined,
    selectedUserId ? users.find((u) => u.id === selectedUserId)?.licensePhoto : null,
  )

  // 면허증 이미지 클릭 핸들러
  const handleLicensePhotoClick = (user: TUser) => {
    if (user.licensePhoto) {
      setSelectedUserId(user.id)
      setSelectedUserName(user.name)
      setShowLicenseModal(true)
    }
  }

  // 모달 닫기
  const closeModal = () => {
    setSelectedUserId(null)
    setSelectedUserName('')
    setShowLicenseModal(false)
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
            onClick={() => router.push(`/admin/users/${user.id}`)}
            className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 text-sm cursor-pointer"
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
                  router.push(`/admin/users/${user.id}`)
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
        {/* 테이블 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <CustomDataTable
            id="users"
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
      {showLicenseModal && (
        <LicenseModal
          licenseUrl={licenseUrl}
          setShowImageModal={setShowLicenseModal}
          imageLoading={imageLoading}
          imageError={imageError}
          onRetry={retryFetchUrl}
          userName={selectedUserName}
        />
      )}
    </>
  )
}

export default UsersTable
