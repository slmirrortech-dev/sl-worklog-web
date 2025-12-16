import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

/**
 * 초기 관리자 등록
 * - 이름: 최승혁
 * - 사번: 1107709
 * - 권한: ADMIN
 */
export async function seedInitialAdmin() {
  console.log('👤 초기 관리자 등록 시작...')

  const userId = '1107709'
  const name = '최승혁'
  const email = `${userId}@temp.invalid`
  const initialPassword = userId // 초기 비밀번호는 사번과 동일

  try {
    // Supabase Admin Client 생성
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // 1. Supabase Auth에서 사용자 확인 또는 생성
    console.log('  📧 Supabase Auth 사용자 확인 중...')

    // 먼저 기존 사용자 확인
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let authUser = existingUsers?.users?.find((u) => u.email === email)

    if (authUser) {
      console.log('  ✅ 기존 Supabase Auth 사용자 발견')
      console.log(`     - Email: ${email}`)
      console.log(`     - Supabase User ID: ${authUser.id}`)
    } else {
      // 없으면 새로 생성
      console.log('  📧 Supabase Auth 사용자 생성 중...')
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: initialPassword,
        email_confirm: true,
      })

      if (authError || !authData.user) {
        console.error('  ❌ Supabase Auth 사용자 생성 실패:', authError?.message)
        return
      }

      authUser = authData.user
      console.log('  ✅ Supabase Auth 사용자 생성 완료')
      console.log(`     - Email: ${email}`)
      console.log(`     - Supabase User ID: ${authUser.id}`)
    }

    // 2. Prisma DB에 사용자 확인 또는 생성
    console.log('  💾 Prisma DB에 사용자 확인 중...')

    // supabaseUserId 또는 userId로 조회
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ supabaseUserId: authUser.id }, { userId: userId }],
      },
    })

    if (user) {
      console.log('  ✅ 기존 Prisma DB 사용자 발견 - 업데이트 중...')
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          supabaseUserId: authUser.id,
          email: email,
          userId: userId,
          name: name,
          role: 'ADMIN',
          mustChangePassword: true,
          isActive: true,
        },
      })
      console.log('  ✅ Prisma DB 사용자 업데이트 완료')
    } else {
      console.log('  💾 Prisma DB에 사용자 생성 중...')
      user = await prisma.user.create({
        data: {
          supabaseUserId: authUser.id,
          email: email,
          userId: userId,
          name: name,
          role: 'ADMIN',
          mustChangePassword: true,
          isActive: true,
        },
      })
      console.log('  ✅ Prisma DB 사용자 생성 완료')
    }

    console.log('  ✅ Prisma DB 사용자 생성 완료')
    console.log(`     - 사번: ${user.userId}`)
    console.log(`     - 이름: ${user.name}`)
    console.log(`     - 권한: ${user.role}`)
    console.log(`     - 초기 비밀번호: ${initialPassword} (사번과 동일)`)
    console.log(`     - 비밀번호 변경 필수: ${user.mustChangePassword}`)

    console.log('\n🎉 초기 관리자 등록 완료!')
    console.log('\n📝 로그인 정보:')
    console.log(`   사번: ${userId}`)
    console.log(`   초기 비밀번호: ${initialPassword}`)
    console.log('   로그인 후 비밀번호를 변경해주세요.')
  } catch (error) {
    console.error('❌ 초기 관리자 등록 실패:', error)
    throw error
  }
}
