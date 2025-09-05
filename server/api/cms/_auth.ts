import { requireAuth } from '~~/server/utils/auth'

export async function requireAdmin(event: any) {
  const payload: any = await requireAuth(event)
  if (!payload || !['SUPERADMIN', 'ADMIN'].includes(payload.role)) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }
  return payload
}
