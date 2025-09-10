import { findUserOrThrow } from '@/lib/service/user.servie'
import UserProfile from '@/app/admin/(main)/users/[id]/UserProfile'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

/** 직원 상세정보 */
const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const { id } = await params
  // 유효한 사용자인지 확인
  const user = await findUserOrThrow(id)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <UserProfile user={user} />
      </div>
    </main>
  )
}

export default UserDetailPage
