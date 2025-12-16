/**
 * Supabase Realtime Presence 채널 키 상수
 */
export const PRESENCE_CHANNELS = {
  WORKPLACE_SETTING: 'presence:workplace-setting',
} as const

export type PresenceChannelKey = (typeof PRESENCE_CHANNELS)[keyof typeof PRESENCE_CHANNELS]

/**
 * Supabase Realtime DB 변경 감지 채널 키 상수
 */
export const REALTIME_CHANNELS = {
  FACTORY_LINE: 'realtime:factory-line',
} as const

export type RealtimeChannelKey = (typeof REALTIME_CHANNELS)[keyof typeof REALTIME_CHANNELS]
