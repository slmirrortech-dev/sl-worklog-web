import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다:', {
    url: supabaseUrl ? '설정됨' : '없음',
    key: supabaseKey ? '설정됨' : '없음',
  })
}

/**
 * 서비스 역할 클라이언트 (관리자 작업용)
 * Storage, Database 직접 접근 등에 사용
 */
export const supabaseServer = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseKey || 'mock-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
  },
)

/**
 * 서버 컴포넌트용 Supabase 클라이언트 (사용자 인증 포함)
 *
 * 사용 예시:
 * ```tsx
 * import { createServerSupabaseClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   return <div>Hello {user?.email}</div>
 * }
 * ```
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // 서버 컴포넌트에서는 쿠키 설정이 불가능할 수 있음
          }
        },
      },
    },
  )
}

/**
 * API Route용 Supabase 클라이언트
 *
 * 사용 예시:
 * ```tsx
 * import { createRouteHandlerClient } from '@/lib/supabase/server'
 *
 * export async function GET(req: NextRequest) {
 *   const supabase = createRouteHandlerClient(req)
 *   const { data: { user } } = await supabase.auth.getUser()
 *   return Response.json({ user })
 * }
 * ```
 */
export function createRouteHandlerClient(request: NextRequest, response?: NextResponse) {
  const res = response || new NextResponse()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return request.cookies.getAll()
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}

/**
 * Middleware용 Supabase 클라이언트
 *
 * 사용 예시:
 * ```tsx
 * import { createMiddlewareClient } from '@/lib/supabase/server'
 *
 * export async function middleware(req: NextRequest) {
 *   const { supabase, response } = createMiddlewareClient(req)
 *   await supabase.auth.getUser()
 *   return response
 * }
 * ```
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          return request.cookies.getAll()
        },
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })

          // 새로운 응답 생성 (업데이트된 쿠키 포함)
          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  return { supabase, response }
}
