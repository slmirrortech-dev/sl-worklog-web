import React from 'react'

/**
 * Admin 전체 레이아웃
 * (main), (sub) 모든 라우트 그룹에 공통 적용
 *
 * 참고: QueryProvider, GlobalDialog, GlobalLoading은
 * 루트 레이아웃(/app/layout.tsx)에서 제공됩니다.
 */
const AdminRootLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default AdminRootLayout
