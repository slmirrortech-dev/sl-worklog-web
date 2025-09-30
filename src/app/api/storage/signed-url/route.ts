import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

export const dynamic = 'force-dynamic'
const BUCKET_NAME = 'licensePhoto'

/** private 버킷에 저장된 이미지 조회 */
export async function getSignedUrl(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) {
    console.error('Missing key parameter in signed-url request')
    return NextResponse.json({ error: 'missing key' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .createSignedUrl(key, 60 * 60)

    if (error) {
      console.error('[signed-url] supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return ApiResponseFactory.success({ url: data?.signedUrl }, 'private 이미지 가져오기 성공')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[signed-url] handler exception:', msg)

    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = withErrorHandler(getSignedUrl)
