import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

/**
 * 라인/공정 데이터 실시간 동기화 훅
 * Supabase Realtime을 통해 데이터베이스 변경사항을 감지하고 동기화
 */
const useMonitorLineDataSync = (refetchQuery?: () => void) => {
  useEffect(() => {
    const channel = supabaseClient.channel('line-process-sync')
    let changeTimeout: NodeJS.Timeout | null = null

    const handleDataChange = (type: string) => {
      // 기존 타이머가 있으면 취소
      if (changeTimeout) {
        clearTimeout(changeTimeout)
      }

      // 500ms 후에 한 번만 처리 (디바운싱)
      changeTimeout = setTimeout(async () => {
        console.log(`🔄 ${type} 데이터 변경 완료 - React Query 새로고침`)

        // React Query 새로고침
        if (refetchQuery) {
          await refetchQuery()
        }
      }, 500)
    }

    // 모든 라인/공정 관련 변경사항 감지
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lines' }, () => {
        handleDataChange('라인')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'processes' }, () => {
        handleDataChange('공정')
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'process_shifts' }, () => {
        handleDataChange('교대조')
      })
      .subscribe()

    return () => {
      if (changeTimeout) {
        clearTimeout(changeTimeout)
      }
      supabaseClient.removeChannel(channel)
    }
  }, [])
}

export default useMonitorLineDataSync
