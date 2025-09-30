import { NextRequest, NextResponse } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { findUserOrThrow } from '@/lib/service/user.servie'
import prisma from '@/lib/core/prisma'
import { supabaseServer } from '@/lib/supabase/server'
// import sharp from 'sharp' // 동적 import로 변경
import { withErrorHandler } from '@/lib/core/api-handler'
import { ApiResponseFactory } from '@/lib/core/api-response-factory'
import { UserResponseDto } from '@/types/user'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const BUCKET_NAME = 'licensePhoto'

/** 사용자별 면허증 이미지 업로드 */
export async function uploadLicense(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log('[upload] Starting upload process...')

    await requireManagerOrAdmin(req)
    const { id } = await params
    console.log('[upload] User ID:', id)

    await findUserOrThrow(id)
    console.log('[upload] User found')

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      console.log('[upload] No file provided')
      return NextResponse.json({ error: '파일 없음' }, { status: 400 })
    }
    console.log('[upload] File received:', file.name, file.size, file.type)

    const user = await prisma.user.findUnique({ where: { id } })
    const oldFileKey = user?.licensePhotoUrl
    console.log('[upload] Old file key:', oldFileKey)

    // 새 파일명 (webp 확장자)
    const newFileKey = `${id}_${Date.now()}.webp`
    console.log('[upload] New file key:', newFileKey)

    // 원본 -> webp 변환 + 리사이즈
    console.log('[upload] Loading sharp module...')
    const sharp = (await import('sharp')).default
    console.log('[upload] Sharp loaded successfully')

    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('[upload] File buffer created, size:', buffer.length)

    console.log('[upload] Starting image processing...')
    const optimizedBuffer = await sharp(buffer)
      .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer()
    console.log('[upload] Image processed, optimized size:', optimizedBuffer.length)

    console.log('[upload] Uploading to Supabase storage...')
    const { error: uploadError } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .upload(newFileKey, optimizedBuffer, { contentType: 'image/webp' })

    if (uploadError) {
      console.error('[upload] Supabase upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
    console.log('[upload] Upload to Supabase successful')

    console.log('[upload] Updating user record...')
    await prisma.user.update({
      where: { id },
      data: { licensePhotoUrl: newFileKey },
    })
    console.log('[upload] User record updated')

    console.log('[upload] Creating signed URL...')
    const { data: signedUrl } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .createSignedUrl(newFileKey, 60 * 60)
    console.log('[upload] Signed URL created')

    if (oldFileKey) {
      console.log('[upload] Removing old file:', oldFileKey)
      await supabaseServer.storage.from(BUCKET_NAME).remove([oldFileKey])
      console.log('[upload] Old file removed')
    }

    console.log('[upload] Upload process completed successfully')
    return ApiResponseFactory.success({ url: signedUrl?.signedUrl }, '사용자 이미지 업로드 완료')
  } catch (error) {
    console.error('[upload] Unexpected error:', error)
    console.error('[upload] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    throw error
  }
}

export const POST = withErrorHandler(uploadLicense)

/** 사용자별 면허증 이미지 삭제 */
async function deleteLicense(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireManagerOrAdmin(req)
  const { id } = await params
  const user = await findUserOrThrow(id)

  if (!user.licensePhotoUrl) {
    throw new Error('삭제할 이미지가 없습니다.')
  }

  // 스토리지에서 삭제
  const { error: removeError } = await supabaseServer.storage
    .from(BUCKET_NAME)
    .remove([user.licensePhotoUrl])

  if (removeError) throw new Error(removeError.message)

  // 경로 초기화
  const freshUser = (await prisma.user.update({
    where: { id },
    data: { licensePhotoUrl: null },
  })) as UserResponseDto

  return ApiResponseFactory.success(freshUser, '사용자 면허증 이미지 삭제 완료')
}

export const DELETE = withErrorHandler(deleteLicense)
