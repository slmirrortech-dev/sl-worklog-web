import { useEffect, useState } from 'react'
import { subDays } from 'date-fns'
import { ShiftType, WorkStatus } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { getWorkLogApi } from '@/lib/api/work-log-api'
import { getWorkLogRequestModel } from '@/types/work-log'

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
  // 검색 필터
  const [startDate, setStartDate] = useState(() => new Date())
  const [endDate, setEndDate] = useState(() => new Date())
  const [shiftType, setShiftType] = useState<ShiftType | 'ALL'>('ALL')
  const [workStatus, setWorkStatus] = useState<WorkStatus | 'ALL'>('ALL')
  const [lineName, setLineName] = useState('')
  const [lineClassNo, setLineClassNo] = useState('ALL')
  const [processName, setProcessName] = useState('')
  const [searchName, setSearchName] = useState('')
  const [progress, setProgress] = useState<'ALL' | 'END' | 'NOT_END'>('ALL')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // 데이터 조회 결과
  const [totalCount, setTotalCount] = useState<number>(0)

  // 필터 초기화
  const resetFilters = () => {
    setStartDate(subDays(new Date(), 7))
    setEndDate(new Date())
    setShiftType('ALL')
    setWorkStatus('ALL')
    setLineName('')
    setLineClassNo('ALL')
    setProcessName('')
    setSearchName('')
    setProgress('ALL')
    setPage(1)
  }

  const workLogQuery = useQuery({
    enabled: true,
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
    workLogQuery.refetch()
  }, [])

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
      setStartDate,
      endDate,
      setEndDate,
      shiftType,
      setShiftType,
      workStatus,
      setWorkStatus,
      lineName,
      setLineName,
      lineClassNo,
      setLineClassNo,
      processName,
      setProcessName,
      searchName,
      setSearchName,
      progress,
      setProgress,
    } as SearchStatesType,
    resetFilters,
    workLogQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  }
}

export default useSearchWorkLog
