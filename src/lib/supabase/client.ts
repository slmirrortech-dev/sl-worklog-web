import { createBrowserClient } from '@supabase/ssr'

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트 (Singleton)
 *
 * 사용 예시:
 * ```tsx
 * 'use client'
 * import { supabaseClient } from '@/lib/supabase/client'
 *
 * const { data: { user } } = await supabaseClient.auth.getUser()
 * ```
 */
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
