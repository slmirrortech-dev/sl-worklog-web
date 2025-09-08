'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BarChart3, Users, Settings, Activity, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

const AdminHeader = () => {
  const pathname = usePathname()

  const navItems = [
    {
      name: '작업 기록',
      href: ROUTES.ADMIN.WORK_LOG,
      icon: BarChart3,
      description: '작업 기록 조회',
    },
    {
      name: '실시간 현황',
      href: ROUTES.ADMIN.STATUS,
      icon: Activity,
      description: '작업자 실시간 상황',
    },
    {
      name: '직원 관리',
      href: ROUTES.ADMIN.USERS,
      icon: Users,
      description: '직원 정보 관리',
    },
    {
      name: '작업장 설정',
      href: ROUTES.ADMIN.PROCESS,
      icon: Settings,
      description: '라인 및 공정 관리',
    },
  ]

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 타이틀 섹션 */}
          <div className="flex items-center gap-4">
            <Link href={ROUTES.ADMIN.STATUS} className="flex items-center gap-3">
              <div>
                <Image
                  src="/logo.png"
                  alt="SL미러텍 로고"
                  width={100}
                  height={40}
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link key={item.name} href={item.href} className="group">
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 px-3 py-2 h-9 transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 font-semibold'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title={item.description}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-base font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* 관리자 정보 및 로그아웃 */}
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.ADMIN.MY_PAGE}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer transition-colors group"
            >
              <User className="w-4 h-4 text-gray-600 transition-colors" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 transition-colors">
                  최승혁 <span className="text-gray-500">(104880)</span>
                </p>
              </div>
            </Link>

            {/* 모바일용 관리자 정보 */}
            <Link
              href={ROUTES.ADMIN.MY_PAGE}
              className="flex sm:hidden items-center gap-1 px-2 py-2 bg-gray-50 rounded-lg cursor-pointer transition-colors group"
              title="최승혁 (104880) - 클릭하여 로그아웃"
            >
              <User className="w-4 h-4 text-gray-600 transition-colors" />
              <span className="text-xs font-medium text-gray-900 transition-colors">
                최승혁 <span className="text-gray-500">(104880)</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="flex overflow-x-auto px-4 py-2 gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.name} href={item.href} className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 px-2 py-1 h-8 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 bg-blue-50 font-semibold'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span className="text-sm">{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
