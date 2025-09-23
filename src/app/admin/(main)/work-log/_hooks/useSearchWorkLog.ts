import { useEffect, useState } from 'react'
import { subDays } from 'date-fns'
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
  shiftType: ShiftType | 'ALL'
  setShiftType: (value: ShiftType | 'ALL') => void
  workStatus: WorkStatus | 'ALL'
  setWorkStatus: (value: WorkStatus | 'ALL') => void
  lineName: string
  setLineName: (value: string) => void
  lineClassNo: string
  setLineClassNo: (value: string) => void
  processName: string
  setProcessName: (value: string) => void
  searchName: string
  setSearchName: (value: string) => void
  progress: 'ALL' | 'END' | 'NOT_END'
  setProgress: (value: 'ALL' | 'END' | 'NOT_END') => void
}

const useSearchWorkLog = () => {
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
  const [shiftType, setShiftType] = useState<ShiftType | 'ALL'>(
    () => getInitialString('shiftType', 'ALL') as ShiftType | 'ALL',
  )
  const [workStatus, setWorkStatus] = useState<WorkStatus | 'ALL'>(
    () => getInitialString('workStatus', 'ALL') as WorkStatus | 'ALL',
  )
  const [lineName, setLineName] = useState(() => getInitialString('lineName', ''))
  const [lineClassNo, setLineClassNo] = useState(() => getInitialString('lineClassNo', 'ALL'))
  const [processName, setProcessName] = useState(() => getInitialString('processName', ''))
  const [searchName, setSearchName] = useState(() => getInitialString('searchName', ''))
  const [progress, setProgress] = useState<'ALL' | 'END' | 'NOT_END'>(
    () => getInitialString('progress', 'ALL') as 'ALL' | 'END' | 'NOT_END',
  )
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
    console.log('start')
    setStartDate(value)
    updateURL({ startDate: value }, true)
  }

  const updateEndDate = (value: Date) => {
    setEndDate(value)
    updateURL({ endDate: value }, true)
  }

  const updateShiftType = (value: ShiftType | 'ALL') => {
    setShiftType(value)
    updateURL({ shiftType: value }, true)
  }

  const updateWorkStatus = (value: WorkStatus | 'ALL') => {
    setWorkStatus(value)
    updateURL({ workStatus: value }, true)
  }

  const updateLineName = (value: string) => {
    setLineName(value)
    updateURL({ lineName: value }, true)
  }

  const updateLineClassNo = (value: string) => {
    setLineClassNo(value)
    updateURL({ lineClassNo: value }, true)
  }

  const updateProcessName = (value: string) => {
    setProcessName(value)
    updateURL({ processName: value }, true)
  }

  const updateSearchName = (value: string) => {
    setSearchName(value)
    updateURL({ searchName: value }, true)
  }

  const updateProgress = (value: 'ALL' | 'END' | 'NOT_END') => {
    setProgress(value)
    updateURL({ progress: value }, true)
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
    setShiftType('ALL')
    setWorkStatus('ALL')
    setLineName('')
    setLineClassNo('ALL')
    setProcessName('')
    setSearchName('')
    setProgress('ALL')
    setPage(1)

    // URL 초기화
    const url = new URL(window.location.href)
    url.search = ''
    router.replace(url.pathname, { scroll: false })
  }

  const workLogQuery = useQuery({
    queryKey: [
      'workLogs',
      page,
      pageSize,
      startDate,
      endDate,
      shiftType,
      workStatus,
      lineName,
      lineClassNo,
      processName,
      searchName,
      progress,
    ],
    queryFn: () =>
      getWorkLogApi({
        startDate,
        endDate,
        shiftType: shiftType === 'ALL' ? undefined : shiftType,
        workStatus: workStatus === 'ALL' ? undefined : workStatus,
        lineName: lineName || undefined,
        lineClassNo: lineClassNo === 'ALL' ? undefined : lineClassNo,
        processName: processName || undefined,
        searchName: searchName || undefined,
        progress: progress === 'ALL' ? undefined : progress,
        skip: (page - 1) * pageSize,
        take: pageSize,
      } as getWorkLogRequestModel),
  })

  useEffect(() => {
    if (workLogQuery.data) {
      setTotalCount(workLogQuery.data.data.totalCount)
    } else {
      setTotalCount(0)
    }
  }, [workLogQuery.data])

  return {
    searchStates: {
      startDate,
      setStartDate: updateStartDate,
      endDate,
      setEndDate: updateEndDate,
      shiftType,
      setShiftType: updateShiftType,
      workStatus,
      setWorkStatus: updateWorkStatus,
      lineName,
      setLineName: updateLineName,
      lineClassNo,
      setLineClassNo: updateLineClassNo,
      processName,
      setProcessName: updateProcessName,
      searchName,
      setSearchName: updateSearchName,
      progress,
      setProgress: updateProgress,
    } as SearchStatesType,
    resetFilters,
    workLogQuery,
    page,
    setPage: updatePage,
    pageSize,
    setPageSize: updatePageSize,
    totalCount,
  }
}

export default useSearchWorkLog
