import { NextRequest, NextResponse } from 'next/server'
import { requireManagerOrAdmin } from '@/lib/utils/auth-guards'
import { findUserOrThrow } from '@/lib/service/user.servie'
import prisma from '@/lib/core/prisma'
import { supabaseServer } from '@/lib/supabase/server'
import { Jimp } from 'jimp'
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

    // 새 파일명 (jpeg 확장자)
    const newFileKey = `${id}_${Date.now()}.jpg`
    console.log('[upload] New file key:', newFileKey)

    // 원본 -> JPEG 변환 + 리사이즈
    console.log('[upload] Starting image processing with Jimp...')

    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('[upload] File buffer created, size:', buffer.length)

    console.log('[upload] Loading image with Jimp...')
    const image = await Jimp.fromBuffer(buffer)
    console.log('[upload] Image loaded, original size:', image.width, 'x', image.height)

    // 1280x720 비율에 맞춰 리사이즈 (비율 유지하며 내부에 맞춤)
    const targetWidth = 1280
    const targetHeight = 720
    const aspectRatio = image.width / image.height
    const targetAspectRatio = targetWidth / targetHeight

    let newWidth, newHeight
    if (aspectRatio > targetAspectRatio) {
      // 가로가 더 길면 가로를 기준으로 맞춤
      newWidth = Math.min(targetWidth, image.width)
      newHeight = newWidth / aspectRatio
    } else {
      // 세로가 더 길면 세로를 기준으로 맞춤
      newHeight = Math.min(targetHeight, image.height)
      newWidth = newHeight * aspectRatio
    }

    console.log('[upload] Resizing to:', Math.round(newWidth), 'x', Math.round(newHeight))
    image.resize({ w: Math.round(newWidth), h: Math.round(newHeight) })

    console.log('[upload] Converting to JPEG...')
    const optimizedBuffer = await image.getBuffer('image/jpeg', { quality: 70 })
    console.log('[upload] Image processed, optimized size:', optimizedBuffer.length)

    console.log('[upload] Uploading to Supabase storage...')
    const { error: uploadError } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .upload(newFileKey, optimizedBuffer, { contentType: 'image/jpeg' })

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
