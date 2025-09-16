import { useEffect, useRef, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { getLineWithProcess } from '@/lib/api/line-with-process-api'
import { LineResponseDto } from '@/types/line-with-process'

/**
 * 라인/공정 데이터 실시간 동기화 훅
 * Supabase Realtime을 통해 데이터베이스 변경사항을 감지하고 동기화
 */
const useLineDataSync = ({
  isEditMode,
  onDataUpdate,
}: {
  isEditMode: boolean
  onDataUpdate: (data: LineResponseDto[]) => void
}) => {
  const [isFetching, setIsFetching] = useState(false)
  const isEditModeRef = useRef(isEditMode)

  // 편집모드 상태를 ref로 관리 (클로저 문제 방지)
  useEffect(() => {
    isEditModeRef.current = isEditMode
  }, [isEditMode])

  useEffect(() => {
    const channel = supabaseClient.channel('line-process-sync')
    let changeTimeout: NodeJS.Timeout | null = null

    const handleDataChange = (type: string) => {
      // 기존 타이머가 있으면 취소
      if (changeTimeout) {
        clearTimeout(changeTimeout)
      }

      // 500ms 후에 한 번만 로그 출력 (디바운싱)
      changeTimeout = setTimeout(async () => {
        console.log(`🔄 ${type} 데이터 변경 완료 - 일괄 처리됨`)

        // 편집모드가 아닐 때만 데이터 동기화 (성능 최적화)
        if (!isEditModeRef.current) {
          setIsFetching(true)
          try {
            const { data } = await getLineWithProcess()
            onDataUpdate(data)
          } catch (e) {
            console.error('Failed to sync line data:', e)
          } finally {
            setIsFetching(false)
          }
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

  return {
    isFetching,
    setIsFetching,
  }
}

export default useLineDataSync
