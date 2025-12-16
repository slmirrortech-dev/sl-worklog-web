import { useEffect } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { REALTIME_CHANNELS } from '@/lib/constants/presence'

const TABLES = ['factory_lines', 'line_shifts', 'process_slots']

export const useFactoryLineRealtime = () => {
  const queryClient = useQueryClient()

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
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Realtime] ${table} changed:`, payload)
          }

          // API 갱신
          queryClient.invalidateQueries({
            queryKey: ['getAllFactoryLineApi'],
          })
        },
      )
    })

    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Successfully subscribed to ${REALTIME_CHANNELS.FACTORY_LINE}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(
          '[Realtime] Channel error. Realtime이 활성화되지 않았을 수 있습니다.',
          '\n해결방법: prisma/enable-realtime.sql 파일을 Supabase SQL Editor에서 실행하세요.',
        )
        if (err) {
          console.error('[Realtime] Error details:', err)
        }
      } else if (status === 'TIMED_OUT') {
        console.error('[Realtime] Subscription timed out')
      } else if (status === 'CLOSED') {
        console.log('[Realtime] Channel closed')
      }

      if (err) {
        console.error('[Realtime] Subscription error:', err)
      }
    })

    return () => {
      void supabaseClient.removeChannel(channel)
    }
  }, [queryClient])
}
