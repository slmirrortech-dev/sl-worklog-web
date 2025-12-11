import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsersApi } from '@/lib/api/user-api'
import { useRouter, useSearchParams } from 'next/navigation'

export type SearchStatesType = {
  search: string
  setSearch: (value: string) => void
  handleSearch: (searchValue?: string) => void
}

const useSearchUsers = (roleFilter: string, gridId: string) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 초기값 가져오기 (gridId 기반)
  const getInitialString = (paramName: string, defaultValue: string) => {
    return searchParams.get(`${gridId}_${paramName}`) || defaultValue
  }

  const getInitialNumber = (paramName: string, defaultValue: number) => {
    const param = searchParams.get(`${gridId}_${paramName}`)
    return param ? parseInt(param, 10) : defaultValue
  }

  // 검색 필터 (사용자 입력용)
  const [search, setSearch] = useState(() => getInitialString('search', ''))

  const [page, setPage] = useState(() => getInitialNumber('page', 1))
  const [pageSize, setPageSize] = useState(() => getInitialNumber('pageSize', 10))

  // 실제 쿼리에 사용되는 검색 조건 (검색 버튼을 눌렀을 때만 업데이트)
  const [appliedSearch, setAppliedSearch] = useState(() => getInitialString('search', ''))

  // 데이터 조회 결과
  const [totalCount, setTotalCount] = useState<number>(0)

  // URL 업데이트 함수
  const updateURL = (params: Record<string, string | number>, resetPage: boolean = true) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)

    Object.entries(params).forEach(([key, value]) => {
      const paramKey = `${gridId}_${key}`
      if (value === '' || value === null || value === undefined) {
        url.searchParams.delete(paramKey)
      } else {
        url.searchParams.set(paramKey, String(value))
      }
    })

    if (resetPage) {
      url.searchParams.set(`${gridId}_page`, '1')
      setPage(1)
    }

    router.replace(url.pathname + url.search, { scroll: false })
  }

  // 검색 실행 함수
  const handleSearch = (searchValue?: string) => {
    const valueToApply = searchValue !== undefined ? searchValue : search
    setAppliedSearch(valueToApply)

    // URL 업데이트
    updateURL(
      {
        search: valueToApply,
      },
      true,
    )
  }

  const updatePage = (value: number) => {
    setPage(value)
    updateURL({ page: value }, false)
  }

  const updatePageSize = (value: number) => {
    setPageSize(value)
    updateURL({ pageSize: value }, true)
  }

  const usersQuery = useQuery({
    queryKey: ['users', gridId, roleFilter, page, pageSize, appliedSearch],
    queryFn: async () => {
      const response = await getUsersApi({
        page,
        pageSize,
        search: appliedSearch || undefined,
        role: roleFilter,
      })
      return response.data
    },
  })

  useEffect(() => {
    if (usersQuery.data) {
      setTotalCount(usersQuery.data.totalCount)
    } else {
      setTotalCount(0)
    }
  }, [usersQuery.data])

  return {
    searchStates: {
      search,
      setSearch,
      handleSearch,
    } as SearchStatesType,
    usersQuery,
    page,
    setPage: updatePage,
    pageSize,
    setPageSize: updatePageSize,
    totalCount,
  }
}

export default useSearchUsers
