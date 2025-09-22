import { findUserOrThrow } from '@/lib/service/user.servie'
import UserProfile from '@/app/admin/(main)/users/[id]/_component/UserProfile'
import { getServerSession } from '@/lib/utils/auth-guards'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

/** 직원 상세정보 */
const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const session = await getServerSession()

  const { id } = await params
  // 유효한 사용자인지 확인
  const user = await findUserOrThrow(id)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <UserProfile
          user={user}
          currentUser={{
            id: session?.id || '',
            userId: session?.userId || '',
            name: session?.name || '알수없음',
            role: session?.role || 'WORKER',
          }}
        />
      </div>
    </main>
  )
}

export default UserDetailPage
