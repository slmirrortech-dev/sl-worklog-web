import React from 'react'
import ChangePasswordWrapper from './ChangePasswordWrapper'
import ChangePasswordClient from './ChangePasswordClient'

// 동적 렌더링 강제
export const dynamic = 'force-dynamic'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChangePasswordWrapper>
      <ChangePasswordClient>{children}</ChangePasswordClient>
    </ChangePasswordWrapper>
  )
}

export default AdminLayout
