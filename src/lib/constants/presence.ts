/**
 * Supabase Realtime Presence 채널 키 상수
 */

export const PRESENCE_CHANNELS = {
  WORKPLACE_SETTING: 'presence:workplace-setting',
} as const

export type PresenceChannelKey = (typeof PRESENCE_CHANNELS)[keyof typeof PRESENCE_CHANNELS]