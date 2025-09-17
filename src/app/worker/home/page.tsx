import React from 'react'
import { getServerSession } from '@/lib/utils/auth-guards'
import TopContents from '@/app/worker/home/_component/TopContents'

/** 홈 페이지 */
const HomePage = async () => {
  const session = await getServerSession()

  return (
    <section className="px-6 pb-6 bg-primary-50">
      <TopContents
        currentUser={
          session
            ? { id: session.id, userId: session.userId, name: session.name, role: session.role }
            : null
        }
      />
    </section>
  )
}

export default HomePage
