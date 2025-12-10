import { useEffect, useState } from 'react'
import { ShiftType } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { searchDefectLogsApi } from '@/lib/api/defect-log-api'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, subMonths } from 'date-fns'

export type SearchStatesType = {
  startDate: Date
  setStartDate: (value: Date) => void
  endDate: Date
  setEndDate: (value: Date) => void
  shiftType: ShiftType | 'ALL'
  setShiftType: (value: ShiftType | 'ALL') => void
  lineName: string
  setLineName: (value: string) => void
  className: string
  setClassName: (value: string) => void
  processName: string
  setProcessName: (value: string) => void
  worker: string
  setWorker: (value: string) => void
  memo: string
  setMemo: (value: string) => void
  handleSearch: () => void
}

const useSearchDefectLog = () => {
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

  const today = new Date()
  const oneMonthAgo = subMonths(today, 1)

  // 검색 필터 (사용자 입력용)
  const [startDate, setStartDate] = useState(() => getInitialDate('startDate', oneMonthAgo))
  const [endDate, setEndDate] = useState(() => getInitialDate('endDate', today))
  const [shiftType, setShiftType] = useState<ShiftType | 'ALL'>(
    () => getInitialString('shiftType', 'ALL') as ShiftType | 'ALL',
  )
  const [lineName, setLineName] = useState(() => getInitialString('lineName', ''))
  const [className, setClassName] = useState(() => getInitialString('className', ''))
  const [processName, setProcessName] = useState(() => getInitialString('processName', ''))
  const [worker, setWorker] = useState(() => getInitialString('worker', ''))
  const [memo, setMemo] = useState(() => getInitialString('memo', ''))

  const [page, setPage] = useState(() => getInitialNumber('page', 1))
  const [pageSize, setPageSize] = useState(() => getInitialNumber('pageSize', 50))

  // 실제 쿼리에 사용되는 검색 조건 (검색 버튼을 눌렀을 때만 업데이트)
  const [appliedStartDate, setAppliedStartDate] = useState(() => getInitialDate('startDate', oneMonthAgo))
  const [appliedEndDate, setAppliedEndDate] = useState(() => getInitialDate('endDate', today))
  const [appliedShiftType, setAppliedShiftType] = useState<ShiftType | 'ALL'>(
    () => getInitialString('shiftType', 'ALL') as ShiftType | 'ALL',
  )
  const [appliedLineName, setAppliedLineName] = useState(() => getInitialString('lineName', ''))
  const [appliedClassName, setAppliedClassName] = useState(() => getInitialString('className', ''))
  const [appliedProcessName, setAppliedProcessName] = useState(() => getInitialString('processName', ''))
  const [appliedWorker, setAppliedWorker] = useState(() => getInitialString('worker', ''))
  const [appliedMemo, setAppliedMemo] = useState(() => getInitialString('memo', ''))

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
    setAppliedShiftType(shiftType)
    setAppliedLineName(lineName)
    setAppliedClassName(className)
    setAppliedProcessName(processName)
    setAppliedWorker(worker)
    setAppliedMemo(memo)

    // URL 업데이트
    updateURL({
      startDate,
      endDate,
      shiftType,
      lineName,
      className,
      processName,
      worker,
      memo,
    }, true)
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
    const oneMonthAgo = subMonths(today, 1)

    setStartDate(oneMonthAgo)
    setEndDate(today)
    setShiftType('ALL')
    setLineName('')
    setClassName('')
    setProcessName('')
    setWorker('')
    setMemo('')
    setPage(1)

    // 적용된 검색 조건도 초기화
    setAppliedStartDate(oneMonthAgo)
    setAppliedEndDate(today)
    setAppliedShiftType('ALL')
    setAppliedLineName('')
    setAppliedClassName('')
    setAppliedProcessName('')
    setAppliedWorker('')
    setAppliedMemo('')

    // URL 초기화
    const url = new URL(window.location.href)
    url.search = ''
    router.replace(url.pathname, { scroll: false })
  }

  const defectLogQuery = useQuery({
    queryKey: [
      'defectLogs',
      page,
      pageSize,
      appliedStartDate,
      appliedEndDate,
      appliedShiftType,
      appliedLineName,
      appliedClassName,
      appliedProcessName,
      appliedWorker,
      appliedMemo,
    ],
    queryFn: async () => {
      const response = await searchDefectLogsApi({
        startDate: format(appliedStartDate, 'yyyy-MM-dd'),
        endDate: format(appliedEndDate, 'yyyy-MM-dd'),
        shiftType: appliedShiftType === 'ALL' ? undefined : appliedShiftType,
        lineName: appliedLineName || undefined,
        className: appliedClassName || undefined,
        processName: appliedProcessName || undefined,
        workerSearch: appliedWorker || undefined,
        memo: appliedMemo || undefined,
        page,
        pageSize,
      })
      return response.data
    },
  })

  useEffect(() => {
    if (defectLogQuery.data) {
      setTotalCount(defectLogQuery.data.totalCount)
    } else {
      setTotalCount(0)
    }
  }, [defectLogQuery.data])

  return {
    searchStates: {
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      shiftType,
      setShiftType,
      lineName,
      setLineName,
      className,
      setClassName,
      processName,
      setProcessName,
      worker,
      setWorker,
      memo,
      setMemo,
      handleSearch,
    } as SearchStatesType,
    resetFilters,
    defectLogQuery,
    page,
    setPage: updatePage,
    pageSize,
    setPageSize: updatePageSize,
    totalCount,
  }
}

export default useSearchDefectLog
