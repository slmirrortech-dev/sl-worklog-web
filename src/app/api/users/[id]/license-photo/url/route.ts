import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { supabaseServer } from '@/lib/supabase/server'

const BUCKET = 'licensePhoto'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser(_req)
  if (!me || me.role !== 'ADMIN') {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: { licensePhoto: true },
  })
  if (!user?.licensePhoto) return NextResponse.json({ url: null })

  // Supabase Storage 서명 URL 생성
  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .createSignedUrl(user.licensePhoto, 60 * 10) // 10분 유효
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ url: data.signedUrl })
}
