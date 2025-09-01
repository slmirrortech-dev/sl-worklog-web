import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function authenticate(loginId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { loginId } })
  if (!user) return null
  const ok = await bcrypt.compare(password, user.password)
  return ok ? user : null
}

export function assertRole(
  user: { role: 'ADMIN' | 'WORKER' },
  allowed: Array<'ADMIN' | 'WORKER'>
) {
  if (!allowed.includes(user.role)) throw new Error('FORBIDDEN')
}
