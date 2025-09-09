import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const BUCKET = 'licensePhoto'

/** GET: 면허증 이미지 URL 조회 */
export async function getLicensePhotoUrl(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 관리자 권한 확인
  await requireAdmin(_req)

  const { id } = await params
  
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true, licensePhotoUrl: true },
  })

  if (!user) {
    return NextResponse.json({ error: '존재하지 않는 사용자입니다' }, { status: 404 })
  }

  if (!user.licensePhotoUrl) {
    return NextResponse.json({ url: null })
  }

  // Supabase Storage에서 서명 URL 생성 (30분 유효)
  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .createSignedUrl(user.licensePhotoUrl, 60 * 30) // 30분

  if (error) {
    console.error('서명 URL 생성 실패:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}

export const GET = withErrorHandler(getLicensePhotoUrl)