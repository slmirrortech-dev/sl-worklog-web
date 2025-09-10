import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/auth-guards'
import { findUserOrThrow } from '@/lib/service/user.servie'
import prisma from '@/lib/core/prisma'
import { supabaseServer } from '@/lib/supabase/server'
import sharp from 'sharp'
export const runtime = 'nodejs'

export const BUCKET_NAME = 'licensePhoto'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req)
    const { id } = await params
    await findUserOrThrow(id)

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: '파일 없음' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id } })
    const oldFileKey = user?.licensePhotoUrl

    // 새 파일명 (webp 확장자)
    const newFileKey = `${id}_${Date.now()}.webp`

    // 원본 -> webp 변환 + 리사이즈
    const buffer = Buffer.from(await file.arrayBuffer())
    const optimizedBuffer = await sharp(buffer)
      .resize(1280, 720, { fit: 'inside', withoutEnlargement: true }) // TV 풀스크린 정도
      .webp({ quality: 70 })
      .toBuffer()

    const { error: uploadError } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .upload(newFileKey, optimizedBuffer, { contentType: 'image/webp' })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    await prisma.user.update({
      where: { id },
      data: { licensePhotoUrl: newFileKey },
    })

    const { data: signedUrl } = await supabaseServer.storage
      .from(BUCKET_NAME)
      .createSignedUrl(newFileKey, 60 * 60)

    if (oldFileKey) {
      await supabaseServer.storage.from(BUCKET_NAME).remove([oldFileKey])
    }

    return NextResponse.json({ url: signedUrl?.signedUrl })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
