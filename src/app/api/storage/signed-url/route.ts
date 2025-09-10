import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { BUCKET_NAME } from '@/app/api/upload/[id]/route'

/** private 버킷에 저장된 이미지 조회 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!key) {
    return NextResponse.json({ error: 'missing key' }, { status: 400 })
  }

  const { data, error } = await supabaseServer.storage
    .from(BUCKET_NAME)
    .createSignedUrl(key, 60 * 60)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ url: data?.signedUrl })
}
