import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Supabase Keep-Alive Endpoint
 *
 * Vercel Cron Job에서 주기적으로 호출하여
 * Supabase 무료 플랜의 7일 비활성화 자동 일시정지를 방지합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron 요청 검증 (보안)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Supabase 환경변수가 설정되지 않았습니다.'
        },
        { status: 500 }
      )
    }

    // Supabase REST API를 ping
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Supabase ping 실패: ${response.status} ${response.statusText}`
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Ping success',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
