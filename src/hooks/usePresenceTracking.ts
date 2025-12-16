import { useEffect, useRef } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import type { PresenceChannelKey } from '@/lib/constants/presence'

/**
 * 현재 사용자의 presence를 특정 채널에 track하는 훅
 *
 * @param channelKey - presence 채널 키
 * @param userData - track할 사용자 데이터
 * @param enabled - presence tracking 활성화 여부
 */
export function usePresenceTracking<T extends Record<string, unknown>>(
  channelKey: PresenceChannelKey,
  userData: T | null,
  enabled = true,
) {
  const tabIdRef = useRef(crypto.randomUUID())

  useEffect(() => {
    if (!enabled || !userData) return

    const channel = supabaseClient.channel(channelKey, {
      config: {
        presence: {
          key: (userData as any).userId || 'unknown',
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${channelKey}] Presence synced:`, state)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            ...userData,
            tabId: tabIdRef.current,
            joinedAt: Date.now(),
          })
        }
      })

    return () => {
      void supabaseClient.removeChannel(channel)
    }
  }, [channelKey, userData, enabled])
}