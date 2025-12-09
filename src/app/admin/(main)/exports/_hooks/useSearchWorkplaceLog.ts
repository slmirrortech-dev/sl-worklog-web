import { useEffect, useState } from 'react'
import { ShiftType, WorkStatus } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { getWorkLogApi } from '@/lib/api/work-log-api'
import { getWorkLogRequestModel } from '@/types/work-log'
import { useRouter, useSearchParams } from 'next/navigation'

export type SearchStatesType = {
  startDate: Date
  setStartDate: (value: Date) => void
  endDate: Date
  setEndDate: (value: Date) => void
}

const useSearchWorkplaceLog = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL에서 초기값 가져오기
  const getInitialDate = (paramName: string, defaultDate: Date) => {
    const param = searchParams.get(paramName)
    return param ? new Date(param) : defaultDate
  }

  const getInitialString = (paramName: string, defaultValue: string) => {
    return searchParams.get(paramName) || defaultValue
  }

  const getInitialNumber = (paramName: string, defaultValue: number) => {
    const param = searchParams.get(paramName)
    return param ? parseInt(param, 10) : defaultValue
  }

  // 검색 필터
  const [startDate, setStartDate] = useState(() => getInitialDate('startDate', new Date()))
  const [endDate, setEndDate] = useState(() => getInitialDate('endDate', new Date()))

  const [page, setPage] = useState(() => getInitialNumber('page', 1))
  const [pageSize, setPageSize] = useState(() => getInitialNumber('pageSize', 50))

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

  // 상태 변경 함수들 (URL 업데이트 포함)
  const updateStartDate = (value: Date) => {
    setStartDate(value)
    updateURL({ startDate: value }, true)
  }

  const updateEndDate = (value: Date) => {
    setEndDate(value)
    updateURL({ endDate: value }, true)
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

    // URL 초기화
    const url = new URL(window.location.href)
    url.search = ''
    router.replace(url.pathname, { scroll: false })
  }

  // const logQuery = useQuery({
  //   queryKey: ['workLogs', page, pageSize, startDate, endDate],
  //   queryFn: () =>
  //     getWorkLogApi({
  //       startDate,
  //       endDate,
  //       skip: (page - 1) * pageSize,
  //       take: pageSize,
  //     } as getWorkLogRequestModel),
  // })

  // TODO: 실제 api로 수정 필요
  const logQuery = useQuery({
    queryKey: ['workplaceLogApi', page, pageSize, startDate, endDate],
    queryFn: () => {
      return {
        data: {},
      }
    },
  })

  useEffect(() => {
    if (logQuery.data) {
      setTotalCount(logQuery.data.data.totalCount)
    } else {
      setTotalCount(0)
    }
  }, [logQuery.data])

  return {
    searchStates: {
      startDate,
      setStartDate: updateStartDate,
      endDate,
      setEndDate: updateEndDate,
    } as SearchStatesType,
    resetFilters,
    logQuery,
    page,
    setPage: updatePage,
    pageSize,
    setPageSize: updatePageSize,
    totalCount,
  }
}

export default useSearchWorkplaceLog
