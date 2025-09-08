// import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'
// import bcrypt from 'bcryptjs'
// import { getIronSession } from 'iron-session'
// import { sessionOptions, SessionUser } from '@/lib/session'
//
// /**
//  * 로그인 API
//  **/
// export async function POST(req: NextRequest) {
//   const { userId, password } = await req.json()
//
//   const user = await prisma.user.findUnique({ where: { userId } })
//   if (!user) {
//     return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 })
//   }
//
//   const valid = await bcrypt.compare(password, user.password)
//   if (!valid) {
//     return NextResponse.json({ error: '비밀번호가 틀렸습니다.' }, { status: 401 })
//   }
//
//   // 세션 생성
//   const res = NextResponse.json({ success: true })
//   const session = await getIronSession<SessionUser>(req, res, sessionOptions)
//
//   session.id = user.id
//   session.userId = user.userId
//   session.name = user.name
//   session.role = user.role as SessionUser['role'] // TODO: enum 타입 사용하기
//
//   await session.save()
//
//   return res
// }
