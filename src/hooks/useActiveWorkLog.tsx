import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

interface ActiveWorkLogInfo {
  isActive: boolean
  workLogId?: string
  startedAt?: Date
}

/**
 * 특정 processShiftId와 waitingWorkerId에 대한 활성 작업 로그를 실시간으로 감시하는 hook
 */
const useActiveWorkLog = (processShiftId: string, waitingWorkerId?: string) => {
  const [activeInfo, setActiveInfo] = useState<ActiveWorkLogInfo>({ isActive: false })
  const [isLoading, setIsLoading] = useState(true)

  // 현재 활성 작업 로그 확인
  const checkActiveWorkLog = async () => {
    if (!processShiftId || !waitingWorkerId) {
      setActiveInfo({ isActive: false })
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabaseClient
        .from('work_log')
        .select('id, userId, userUserId, processShiftId, endedAt, startedAt')
        .eq('processShiftId', processShiftId)
        .eq('userId', waitingWorkerId)
        .is('endedAt', null)
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error)
      }

      setActiveInfo({
        isActive: !!data,
        workLogId: data?.id,
        startedAt: data?.startedAt
          ? new Date(new Date(data.startedAt).getTime() + 9 * 60 * 60 * 1000)
          : undefined,
      })
    } catch (error) {
      console.error('Error checking active work log:', error)
      setActiveInfo({ isActive: false })
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 로딩 및 Realtime 구독
  useEffect(() => {
    // 초기 상태 로딩
    checkActiveWorkLog()

    // processShiftId나 waitingWorkerId가 없으면 구독하지 않음
    if (!processShiftId || !waitingWorkerId) {
      return
    }

    // Realtime 구독 설정
    const channel = supabaseClient
      .channel(`work-log-${processShiftId}-${waitingWorkerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_log',
          filter: `processShiftId=eq.${processShiftId}`,
        },
        (payload) => {
          // 해당 사용자의 작업 로그인지 확인
          const newRecord = payload.new as any
          const oldRecord = payload.old as any

          if (newRecord?.userId === waitingWorkerId || oldRecord?.userId === waitingWorkerId) {
            checkActiveWorkLog() // 변경사항이 있으면 다시 확인
          }
        },
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [processShiftId, waitingWorkerId])

  return {
    startedAt: activeInfo.startedAt,
    isActive: activeInfo.isActive,
    workLogId: activeInfo.workLogId,
    isLoading,
  }
}

export default useActiveWorkLog
