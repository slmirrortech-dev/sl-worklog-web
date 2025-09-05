import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET = 'licensePhoto'
const ALLOWED = ['image/jpeg', 'image/jpg'] // ← JPEG만 허용 (클라이언트에서 변환해서 전송)
const LIMIT = 5 * 1024 * 1024 // 5MB

/** POST: 업로드(덮어쓰기) */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser(req)
  console.log('업로드 요청한 관리자:', me?.name, me?.loginId, me?.role)
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { id } = await params
  console.log('업로드 대상 사용자 ID:', id)
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, loginId: true, licensePhoto: true },
  })
  console.log('대상 사용자 정보:', user)
  if (!user) return NextResponse.json({ error: '존재하지 않는 사용자' }, { status: 404 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file 필드가 필요합니다' }, { status: 400 })

  // JPEG만 받음 (클라는 PNG/HEIC를 JPEG로 변환해서 보낸다는 전제)
  console.log('업로드된 파일 타입:', file.type, '파일명:', file.name, '크기:', file.size)
  if (!ALLOWED.includes(file.type || '')) {
    console.error('허용되지 않은 파일 타입:', file.type)
    return NextResponse.json(
      {
        error: `이미지는 JPEG만 허용됩니다. 현재 파일 타입: ${file.type}. PNG/HEIC는 JPEG로 변환 후 업로드하세요.`,
      },
      { status: 400 },
    )
  }
  if (typeof file.size === 'number' && file.size > LIMIT) {
    return NextResponse.json({ error: '파일 용량은 5MB 이하만 허용됩니다' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const key = `users/${id}/license.jpg`
  console.log('스토리지 업로드 키:', key, '바이트 크기:', bytes.length)

  // 기존에 다른 경로를 쓰고 있었다면 정리(키가 다를 때만)
  if (user.licensePhoto && user.licensePhoto !== key) {
    console.log('기존 파일 삭제:', user.licensePhoto)
    await supabaseServer.storage
      .from(BUCKET)
      .remove([user.licensePhoto])
      .catch((err) => console.error('기존 파일 삭제 실패:', err))
  }

  console.log('Supabase 업로드 시도...')
  const { data, error } = await supabaseServer.storage.from(BUCKET).upload(key, bytes, {
    contentType: 'image/jpeg',
    upsert: true, // 덮어쓰기
    cacheControl: '0',
  })

  if (error) {
    console.error('Supabase 업로드 에러:', error)
    return NextResponse.json({ error: `업로드 실패: ${error.message}` }, { status: 500 })
  }

  console.log('Supabase 업로드 성공:', data)

  // DB에 파일 경로 저장
  console.log('DB 업데이트 시도, 경로:', data.path)
  const updated = await prisma.user.update({
    where: { id },
    data: { licensePhoto: data.path },
    select: { id: true, name: true, loginId: true, licensePhoto: true },
  })
  console.log('DB 업데이트 결과:', updated)

  // 프리뷰용 서명 URL(1시간)
  const { data: signed, error: signError } = await supabaseServer.storage
    .from(BUCKET)
    .createSignedUrl(key, 60 * 60)
  if (signError) {
    console.error('서명 URL 생성 실패:', signError)
  } else {
    console.log('서명 URL 생성 성공:', signed?.signedUrl?.substring(0, 50) + '...')
  }

  const response = { success: true, data: updated, previewUrl: signed?.signedUrl }
  console.log('최종 응답:', response)
  return NextResponse.json(response)
}

/** DELETE: 삭제 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser(req)
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: '권한 없음' }, { status: 403 })

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, licensePhoto: true },
    })
    if (!user) return NextResponse.json({ error: '존재하지 않는 사용자' }, { status: 404 })
    if (!user.licensePhoto)
      return NextResponse.json({ error: '삭제할 면허증 이미지가 없습니다' }, { status: 404 })

    const value = user.licensePhoto

    // Supabase Storage 파일 삭제
    const { error } = await supabaseServer.storage.from(BUCKET).remove([value])
    if (error) console.error('Storage 삭제 실패:', error.message)

    const updated = await prisma.user.update({
      where: { id },
      data: { licensePhoto: null },
      select: { id: true, licensePhoto: true },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: '면허증 이미지가 삭제되었습니다',
    })
  } catch (error) {
    console.error('면허증 삭제 실패:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
