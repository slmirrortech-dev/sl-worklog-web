import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  loginId: string
  name: string
  role: 'ADMIN' | 'WORKER'
  isSuperAdmin: boolean
}

export function useAuthCheck(requiredRoles?: Array<'ADMIN' | 'WORKER'>) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)

          // 역할 확인
          if (requiredRoles && !requiredRoles.includes(data.user.role)) {
            // 권한 없음 - 적절한 로그인 페이지로 리다이렉트
            if (data.user.role === 'WORKER') {
              router.push('/login')
            } else {
              router.push('/admin/login')
            }
            return
          }
        } else {
          // 세션 만료 또는 없음
          setUser(null)
          
          // 현재 경로에 따라 적절한 로그인 페이지로 리다이렉트
          const currentPath = window.location.pathname
          if (currentPath.startsWith('/admin')) {
            router.push('/admin/login')
          } else {
            router.push('/login')
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
        
        // 에러 시에도 현재 경로에 따라 리다이렉트
        const currentPath = window.location.pathname
        if (currentPath.startsWith('/admin')) {
          router.push('/admin/login')
        } else {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRoles])

  return { user, isLoading }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch (error) {
    console.error('Logout error:', error)
  }
  
  // 모든 로컬 스토리지 정리
  localStorage.removeItem('user')
  localStorage.removeItem('admin-token')
  localStorage.removeItem('worker-info')
  
  // 메인 페이지로 리다이렉트
  window.location.href = '/'
}