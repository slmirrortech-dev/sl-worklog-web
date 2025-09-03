import { prisma } from '@/lib/prisma'
import { userSelect } from '@/app/api/users/[id]/route'
import { ApiError } from '@/lib/errors'

/**
 * 사용자가 존재하는지 체크하고 반환
 * */
export async function findUserOrThrow(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect })
  if (!user) throw new ApiError('존재하지 않는 사용자입니다.', 404, 'NOT_FOUND')
  return user
}
