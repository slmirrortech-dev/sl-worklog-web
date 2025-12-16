import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import type { PresenceChannelKey } from '@/lib/constants/presence'

/**
 * Presence 데이터 타입 정의
 */
export interface PresenceData {
  userId: string
  name: string
  userIdString: string
  tabId: string
  page?: string
  joinedAt: number
  presence_ref: string
}

/**
 * 특정 채널의 presence를 구독하는 훅
 *
 * @param channelKey - presence 채널 키
 * @param enabled - 구독 활성화 여부
 * @returns 현재 접속 중인 사용자 목록
 */
export function usePresenceSubscription(channelKey: PresenceChannelKey, enabled = true) {
  const [users, setUsers] = useState<PresenceData[]>([])

  useEffect(() => {
    if (!enabled) return

    const channel = supabaseClient.channel(channelKey, {
      config: {
        presence: {
          key: 'observer',
        },
      },
    })

    const updatePresence = () => {
      const state = channel.presenceState()

      if (process.env.NODE_ENV === 'development') {
        console.log(`[${channelKey}] Presence updated:`, state)
      }

      // 모든 presence 평탄화 (타입 단언)
      const allPresences = Object.values(state).flat() as PresenceData[]

      // userId 기준으로 중복 제거 (탭 여러 개 방지)
      const uniqueUsersMap = new Map(allPresences.map((p) => [p.userId, p]))

      setUsers(Array.from(uniqueUsersMap.values()))
    }

    channel
      // 최초 동기화
      .on('presence', { event: 'sync' }, updatePresence)
      // 나중에 들어온 사용자
      .on('presence', { event: 'join' }, updatePresence)
      // 나간 사용자
      .on('presence', { event: 'leave' }, updatePresence)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // sync 이벤트 놓쳤을 경우 대비
          setTimeout(updatePresence, 0)
        }
      })

    return () => {
      void supabaseClient.removeChannel(channel)
    }
  }, [channelKey, enabled])

  return users
}