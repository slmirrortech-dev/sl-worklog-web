import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchWorkplaceSnapshotsApi } from '@/lib/api/workplace-snapshot-api'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'

export type SearchStatesType = {
  startDate: Date
  setStartDate: (value: Date) => void
  endDate: Date
  setEndDate: (value: Date) => void
  handleSearch: () => void
}

const useSearchWorkplaceLog = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 초기값 가져오기
  const getInitialDate = (paramName: string, defaultDate: Date) => {
    const param = searchParams.get(paramName)
    return param ? new Date(param) : defaultDate
  }

  const getInitialNumber = (paramName: string, defaultValue: number) => {
    const param = searchParams.get(paramName)
    return param ? parseInt(param, 10) : defaultValue
  }

  const today = new Date()

  // 검색 필터 (사용자 입력용)
  const [startDate, setStartDate] = useState(() => getInitialDate('startDate', today))
  const [endDate, setEndDate] = useState(() => getInitialDate('endDate', today))

  const [page, setPage] = useState(() => getInitialNumber('page', 1))
  const [pageSize, setPageSize] = useState(() => getInitialNumber('pageSize', 50))

  // 실제 쿼리에 사용되는 검색 조건 (검색 버튼을 눌렀을 때만 업데이트)
  const [appliedStartDate, setAppliedStartDate] = useState(() => getInitialDate('startDate', today))
  const [appliedEndDate, setAppliedEndDate] = useState(() => getInitialDate('endDate', today))

  // 데이터 조회 결과
  const [totalCount, setTotalCount] = useState<number>(0)

  // URL 업데이트 함수
  const updateURL = (params: Record<string, string | number | Date>, resetPage: boolean = true) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)

    Object.entries(params).forEach(([key, value]) => {
      if (value instanceof Date) {
        url.searchParams.set(key, value.toISOString().split('T')[0])
      } else if (value === '' || value === 'ALL' || value === null || value === undefined) {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, String(value))
      }
    })

    if (resetPage) {
      url.searchParams.set('page', '1')
      setPage(1)
    }

    router.replace(url.pathname + url.search, { scroll: false })
  }

  // 검색 실행 함수
  const handleSearch = () => {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)

    // URL 업데이트
    updateURL(
      {
        startDate,
        endDate,
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

  // 필터 초기화
  const resetFilters = () => {
    const today = new Date()

    setStartDate(today)
    setEndDate(today)
    setPage(1)

    // 적용된 검색 조건도 초기화
    setAppliedStartDate(today)
    setAppliedEndDate(today)

    // URL 초기화
    const url = new URL(window.location.href)
    url.search = ''
    router.replace(url.pathname, { scroll: false })
  }

  const snapshotQuery = useQuery({
    queryKey: ['workplaceSnapshots', page, pageSize, appliedStartDate, appliedEndDate],
    queryFn: async () => {
      const response = await searchWorkplaceSnapshotsApi({
        startDate: `${format(appliedStartDate, 'yyyy-MM-dd')} 00:00:00`,
        endDate: `${format(appliedEndDate, 'yyyy-MM-dd')} 23:59:59`,
        page,
        pageSize,
      })
      return response.data
    },
  })

  useEffect(() => {
    if (snapshotQuery.data) {
      setTotalCount(snapshotQuery.data.totalCount)
    } else {
      setTotalCount(0)
    }
  }, [snapshotQuery.data])

  return {
    searchStates: {
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      handleSearch,
    } as SearchStatesType,
    resetFilters,
    snapshotQuery,
    page,
    setPage: updatePage,
    pageSize,
    setPageSize: updatePageSize,
    totalCount,
    appliedStartDate,
    appliedEndDate,
  }
}

export default useSearchWorkplaceLog
