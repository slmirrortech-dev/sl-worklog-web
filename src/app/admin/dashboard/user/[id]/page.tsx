import { findUserOrThrow } from '@/lib/service/user.servie'
import UserProfile from '@/app/admin/dashboard/user/[id]/layouts/UserProfile'
import { toUserModel } from '@/types/adapter/user.adapter'

interface UserDetailPageProps {
  params: { id: string }
}

/** 직원 상세정보 */
const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const user = await findUserOrThrow(params.id)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <UserProfile user={toUserModel(user)} />
      </div>
    </main>
  )
}

export default UserDetailPage
