import 'server-only'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다:', {
    url: supabaseUrl ? '설정됨' : '없음',
    key: supabaseKey ? '설정됨' : '없음',
  })
}

export const supabaseServer = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseKey || 'mock-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
)
