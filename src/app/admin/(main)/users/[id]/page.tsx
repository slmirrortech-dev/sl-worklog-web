import { findUserOrThrow } from '@/lib/service/user.servie'
import UserProfile from '@/app/admin/(main)/users/[id]/_component/UserProfile'
import { cookies } from 'next/headers'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

/** 직원 상세정보 */
const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  // TODO: 리팩토링 필요
  const cookieStore = cookies()
  const cookieHeader = cookieStore.toString() // 모든 쿠키를 헤더 문자열로 변환

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users/current-user`, {
    cache: 'no-store',
    headers: { Cookie: cookieHeader },
  })

  const { data: currentUser } = await res.json()

  const { id } = await params
  // 유효한 사용자인지 확인
  const user = await findUserOrThrow(id)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <UserProfile user={user} currentUser={currentUser} />
      </div>
    </main>
  )
}

export default UserDetailPage
