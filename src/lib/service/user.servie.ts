import prisma from '@/lib/core/prisma'
import { ApiError } from '@/lib/core/errors'
import { InternalUserDto } from '@/types/user'

/**
 * 사용자가 존재하는지 체크하고 반환 (내부용 - supabaseUserId 포함)
 * */
export async function findUserOrThrow(id: string): Promise<InternalUserDto> {
  const user = await prisma.user.findUnique({
    where: { id },
  })
  if (!user) throw new ApiError('존재하지 않는 사용자입니다.', 404, 'NOT_FOUND')
  return user
}
