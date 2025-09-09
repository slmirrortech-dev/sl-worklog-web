import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/auth-guards'
import { withErrorHandler } from '@/lib/core/api-handler'
import prisma from '@/lib/core/prisma'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const BUCKET = 'licensePhoto'
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/** POST: 면허증 이미지 업로드 */
export async function uploadLicensePhoto(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 관리자 권한 확인
  await requireAdmin(req)

  const { id } = await params
  
  // 사용자 존재 확인
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, userId: true, licensePhotoUrl: true },
  })
  
  if (!user) {
    return NextResponse.json({ error: '존재하지 않는 사용자입니다' }, { status: 404 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  
  if (!file) {
    return NextResponse.json({ error: 'file 필드가 필요합니다' }, { status: 400 })
  }

  // 파일 타입 검증
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `허용되지 않은 파일 타입입니다. (${ALLOWED_TYPES.join(', ')})` },
      { status: 400 }
    )
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: '파일 크기는 5MB 이하만 허용됩니다' }, { status: 400 })
  }

  try {
    // 파일을 Buffer로 변환
    const bytes = Buffer.from(await file.arrayBuffer())
    const key = `users/${id}/license.jpg`

    // 기존 파일이 있다면 삭제 (경로가 다를 때만)
    if (user.licensePhotoUrl && user.licensePhotoUrl !== key) {
      await supabaseServer.storage
        .from(BUCKET)
        .remove([user.licensePhotoUrl.replace(`${BUCKET}/`, '')])
        .catch((err) => console.error('기존 파일 삭제 실패:', err))
    }

    // Supabase Storage에 업로드
    const { data, error } = await supabaseServer.storage.from(BUCKET).upload(key, bytes, {
      contentType: 'image/jpeg',
      upsert: true, // 덮어쓰기
      cacheControl: '0',
    })

    if (error) {
      console.error('Supabase 업로드 에러:', error)
      return NextResponse.json({ error: `업로드 실패: ${error.message}` }, { status: 500 })
    }

    const storagePath = data.path
    
    // DB에 스토리지 경로 저장
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { licensePhotoUrl: storagePath },
      select: { id: true, name: true, userId: true, licensePhotoUrl: true },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '면허증 이미지가 업로드되었습니다'
    })
  } catch (error) {
    console.error('면허증 업로드 실패:', error)
    return NextResponse.json({ error: '업로드 중 오류가 발생했습니다' }, { status: 500 })
  }
}

/** DELETE: 면허증 이미지 삭제 */
export async function deleteLicensePhoto(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 관리자 권한 확인
  await requireAdmin(req)

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, licensePhotoUrl: true },
    })
    
    if (!user) {
      return NextResponse.json({ error: '존재하지 않는 사용자입니다' }, { status: 404 })
    }
    
    if (!user.licensePhotoUrl) {
      return NextResponse.json({ error: '삭제할 면허증 이미지가 없습니다' }, { status: 404 })
    }

    // Supabase Storage에서 파일 삭제
    const { error } = await supabaseServer.storage.from(BUCKET).remove([user.licensePhotoUrl])
    if (error) {
      console.error('Storage 삭제 실패:', error.message)
    }

    // DB에서 URL 제거
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { licensePhotoUrl: null },
      select: { id: true, licensePhotoUrl: true },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '면허증 이미지가 삭제되었습니다',
    })
  } catch (error) {
    console.error('면허증 삭제 실패:', error)
    return NextResponse.json({ error: '삭제 중 오류가 발생했습니다' }, { status: 500 })
  }
}

export const POST = withErrorHandler(uploadLicensePhoto)
export const DELETE = withErrorHandler(deleteLicensePhoto)