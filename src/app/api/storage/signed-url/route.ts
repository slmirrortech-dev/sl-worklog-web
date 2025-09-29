import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { BUCKET_NAME } from '@/app/api/upload/[id]/route'
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'

export const dynamic = 'force-dynamic'

/** private 버킷에 저장된 이미지 조회 */
export async function getSignedUrl(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) {
    console.error('Missing key parameter in signed-url request')
    return NextResponse.json({ error: 'missing key' }, { status: 400 })
  }

  console.log('Requesting signed URL for key:', key, 'from bucket:', BUCKET_NAME)

  const { data, error } = await supabaseServer.storage
    .from(BUCKET_NAME)
    .createSignedUrl(key, 60 * 60)

  if (error) {
    console.error('Supabase storage error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('Successfully created signed URL:', data?.signedUrl ? 'URL created' : 'No URL')
  return ApiResponseFactory.success({ url: data?.signedUrl }, 'private 이미지 가져오기 성공')
}

export const GET = withErrorHandler(getSignedUrl)
