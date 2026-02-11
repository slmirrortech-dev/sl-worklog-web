import { useEffect, useRef, useCallback } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { REALTIME_CHANNELS } from '@/lib/constants/presence'

const TABLES = ['factory_lines', 'line_shifts', 'process_slots', 'work_classes', 'factory_configs']

export const useFactoryLineRealtime = () => {
  const queryClient = useQueryClient()
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const pendingRefetch = useRef(false)

  // 디바운스된 refetch 함수
  const debouncedRefetch = useCallback(() => {
    // 이미 대기 중인 refetch가 있으면 스킵
    if (pendingRefetch.current) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    pendingRefetch.current = true

    // 트랜잭션 완료를 기다리기 위해 지연
    debounceTimer.current = setTimeout(async () => {
      console.log('[Realtime] Refetching all queries...')

      try {
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['getWorkClassesApi'] }),
          queryClient.refetchQueries({ queryKey: ['getAllFactoryLineApi'] }),
          queryClient.refetchQueries({ queryKey: ['getFactoryConfigApi'] }),
        ])
        console.log('[Realtime] Refetch completed')
      } catch (err) {
        console.error('[Realtime] Refetch failed:', err)
      } finally {
        pendingRefetch.current = false
      }
    }, 300) // 여러 이벤트를 묶기 위한 디바운스
  }, [queryClient])

  useEffect(() => {
    const channel = supabaseClient.channel(REALTIME_CHANNELS.FACTORY_LINE)

    TABLES.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          console.log(`[Realtime] ${table} ${payload.eventType}`)
          debouncedRefetch()
        },
      )
    })

    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Successfully subscribed to ${REALTIME_CHANNELS.FACTORY_LINE}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Realtime] Channel error:', err)
      }
    })

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      void supabaseClient.removeChannel(channel)
    }
  }, [queryClient, debouncedRefetch])
}
