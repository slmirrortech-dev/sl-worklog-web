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
