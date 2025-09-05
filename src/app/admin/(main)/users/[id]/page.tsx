import { findUserOrThrow } from '@/lib/service/user.servie'
import UserProfile from '@/app/admin/(main)/users/[id]/UserProfile'
import { toUserModel } from '@/types/adapter/user.adapter'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

/** 직원 상세정보 */
const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const { id } = await params
  const user = await findUserOrThrow(id)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <UserProfile user={toUserModel(user)} />
      </div>
    </main>
  )
}

export default UserDetailPage
