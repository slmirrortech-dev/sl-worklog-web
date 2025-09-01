import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/users/{id}/license-photo:
 *   post:
 *     summary: 사용자 자격증 사진 업로드(로컬 저장)
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200: { description: 업로드 성공 }
 *       400: { description: 잘못된 입력 }
 *       403: { description: 권한 없음 }
 *       404: { description: 없음 }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const me = await getSessionUser(req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!target)
    return NextResponse.json({ error: '존재하지 않는 사용자' }, { status: 404 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file)
    return NextResponse.json(
      { error: 'file 필드가 필요합니다' },
      { status: 400 }
    )

  if (!file.type?.startsWith('image/')) {
    return NextResponse.json(
      { error: '이미지 파일만 업로드 가능합니다' },
      { status: 400 }
    )
  }
  // (선택) 5MB 제한
  // @ts-ignore - Next.js File에 size 존재
  if (
    typeof (file as any).size === 'number' &&
    (file as any).size > 5 * 1024 * 1024
  ) {
    return NextResponse.json(
      { error: '파일 용량은 5MB 이하만 허용됩니다' },
      { status: 400 }
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const ext =
    path.extname(file.name || '') ||
    (file.type === 'image/png'
      ? '.png'
      : file.type === 'image/jpeg'
        ? '.jpg'
        : file.type === 'image/webp'
          ? '.webp'
          : '.bin')

  const fileName = `${params.id}-${Date.now()}-${crypto.randomUUID()}${ext}`
  const dir = path.join(process.cwd(), 'public', 'uploads', 'licenses')
  await mkdir(dir, { recursive: true })
  const absPath = path.join(dir, fileName)
  await writeFile(absPath, bytes)

  const publicPath = `/uploads/licenses/${fileName}` // <img src=...> 로 바로 사용 가능

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { licensePhoto: publicPath },
    select: { id: true, licensePhoto: true },
  })

  return NextResponse.json({ success: true, data: updated })
}
