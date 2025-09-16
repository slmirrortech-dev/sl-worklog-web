import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { SessionUser } from '@/lib/core/session'

const EDIT_LOCK_CHANNEL = 'edit-locks'

// 편집 잠금 정보 타입
export interface LockInfo {
  id: string
  resourceType: string
  lockedBy: string
  lockedByName: string
  lockedByUserId: string
  lockedAt: string
  heartbeatAt: string
  isEditMode: boolean // 내가 편집 중인지
  isLocked: boolean // 다른 사람이 잠금 중인지
  lockedByUser: string // 잠근 사람 이름
}

/**
 * 작업장 편집 모드 잠금 hook
 * Supabase Realtime 구독 (edit_locks 테이블)
 */
// 원본 데이터 타입 (DB에서 가져오는 데이터)
interface RawLockData {
  id: string
  resourceType: string
  lockedBy: string
  lockedByName: string
  lockedByUserId: string
  lockedAt: string
  heartbeatAt: string
}

const useEditLock = (currentUser: SessionUser) => {
  const [rawLockInfo, setRawLockInfo] = useState<RawLockData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 계산된 값들을 포함한 lockInfo 객체 생성
  const lockInfo: LockInfo = rawLockInfo
    ? {
        ...rawLockInfo,
        isEditMode: rawLockInfo.lockedBy === currentUser.id, // 내가 편집 중인지
        isLocked: rawLockInfo && rawLockInfo.lockedBy !== currentUser.id, // 다른 사람이 잠금 중인지
        lockedByUser: rawLockInfo.lockedByName, // 잠근 사람 이름
      }
    : {
        id: '',
        resourceType: '',
        lockedBy: '',
        lockedByName: '',
        lockedByUserId: '',
        lockedAt: '',
        heartbeatAt: '',
        isEditMode: false,
        isLocked: false,
        lockedByUser: '',
      }

  // 초기 편집 상태 로딩
  const loadCurrentLockState = async () => {
    try {
      const { data } = await supabaseClient
        .from('edit_locks')
        .select('*')
        .eq('resourceType', 'setting-line')
        .maybeSingle()

      if (data) {
        setRawLockInfo(data as RawLockData)
      }
    } catch (error) {
      // 데이터가 없으면 정상 (편집 중이 아님)
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 로딩 및 Realtime 구독
  useEffect(() => {
    // 초기 상태 로딩
    loadCurrentLockState()

    // Realtime 구독 설정
    const channel = supabaseClient
      .channel(EDIT_LOCK_CHANNEL)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'edit_locks' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setRawLockInfo(null) // 편집 종료
        } else {
          setRawLockInfo(payload.new as RawLockData) // 편집 시작/업데이트
        }
      })
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [])

  // 편집 시작
  const startEditing = async () => {
    await supabaseClient.from('edit_locks').upsert({
      id: 'global-lock',
      resourceType: 'setting-line',
      lockedBy: currentUser.id,
      lockedByName: currentUser.name,
      lockedByUserId: currentUser.userId,
    })
  }

  // 편집 종료
  const stopEditing = async () => {
    await supabaseClient.from('edit_locks').delete().eq('resourceType', 'setting-line')
  }

  return {
    lockInfo,
    startEditing,
    stopEditing,
    isLoading,
  }
}

export default useEditLock
