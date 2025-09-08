// import { NextRequest, NextResponse } from 'next/server'
// import { getSessionUser } from '@/lib/bak_session'
// import { prisma } from '@/lib/prisma'
// import { supabaseServer } from '@/lib/supabase/server'
//
// const BUCKET = 'licensePhoto'
//
// export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   const current-user = await getSessionUser(_req)
//   if (!current-user || current-user.role !== 'ADMIN') {
//     return NextResponse.json({ error: '권한 없음' }, { status: 403 })
//   }
//
//   const { id } = await params
//   console.log('URL 조회 요청 - 사용자 ID:', id)
//   const user = await prisma.user.findUnique({
//     where: { id },
//     select: { id: true, name: true, loginId: true, licensePhoto: true },
//   })
//   console.log('URL 조회 - 사용자 정보:', user)
//
//   if (!user?.licensePhoto) {
//     console.log('licensePhoto가 null/undefined:', user?.licensePhoto)
//     return NextResponse.json({ url: null })
//   }
//
//   console.log('서명 URL 생성 시도, 경로:', user.licensePhoto)
//   // Supabase Storage 서명 URL 생성 (유효기간 단축으로 성능 향상)
//   const { data, error } = await supabaseServer.storage
//     .from(BUCKET)
//     .createSignedUrl(user.licensePhoto, 60 * 30) // 30분 유효 (성능 향상)
//
//   if (error) {
//     console.error('서명 URL 생성 실패:', error)
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
//
//   console.log('서명 URL 생성 성공:', data.signedUrl?.substring(0, 50) + '...')
//   return NextResponse.json({ url: data.signedUrl })
// }
