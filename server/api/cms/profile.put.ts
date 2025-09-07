import { db } from '~~/server/utils/db'
import { requireAdmin } from './_auth'
import { z } from 'zod'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { unlink } from 'node:fs/promises'

const schema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  avatar: z.string().nullable().optional(),
  remove_avatar: z.boolean().optional(),
  is_open_joki: z.boolean().optional(),
  metadata_joki: z.any().optional(),
})

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export default defineEventHandler(async (event) => {
  const payload: any = await requireAdmin(event)
  const body = await readBody(event)
  const { name, username, avatar, remove_avatar, is_open_joki, metadata_joki } = schema.parse(body)

  const user = await db.user.findUnique({ where: { id: payload.id } })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })
  const u: any = user

  // Username change constraint (1 month)
  let updateLastUsernameAt: Date | null = null
  if (username !== u.username) {
    // check unique
    const exists = await db.user.findUnique({ where: { username } })
    if (exists && exists.id !== u.id) {
      throw createError({ statusCode: 400, message: 'Username already taken' })
    }
    // check cooldown 30 days
    const last = u.last_username_at as Date | null | undefined
    if (last) {
      const nextAllowed = addDays(new Date(last), 30)
      if (new Date() < nextAllowed) {
        const daysLeft = Math.ceil((+nextAllowed - Date.now()) / (1000 * 60 * 60 * 24))
        throw createError({ statusCode: 400, message: `Username can only be changed again in ${daysLeft} day(s)` })
      }
    }
    updateLastUsernameAt = new Date()
  }

  // Handle avatar file removal if needed
  async function removeOldAvatarIfNeeded() {
    const old = u.avatar as string | null | undefined
    if (!old) return
    // Only delete if within our uploads dir
    if (old.startsWith('/uploads/')) {
      // ensure we don't treat it as absolute path when joining
      const rel = old.startsWith('/') ? old.slice(1) : old
      const abs = join(process.cwd(), 'public', rel)
      try {
        if (existsSync(abs)) await unlink(abs)
      } catch (e) {
        // ignore delete error
      }
    }
  }

  let newAvatar: string | null | undefined = undefined
  if (remove_avatar) {
    if (u.avatar) await removeOldAvatarIfNeeded()
    newAvatar = null
  } else if (typeof avatar !== 'undefined' && avatar !== u.avatar) {
    if (u.avatar) await removeOldAvatarIfNeeded()
    newAvatar = avatar
  }

  const data: any = {
    name,
    username,
  }
  if (typeof is_open_joki !== 'undefined') data.is_open_joki = is_open_joki
  if (typeof metadata_joki !== 'undefined') data.metadata_joki = metadata_joki
  if (typeof newAvatar !== 'undefined') data.avatar = newAvatar
  if (updateLastUsernameAt) data.last_username_at = updateLastUsernameAt

  const updated = await db.user.update({ where: { id: u.id }, data })
  const { password: _p, ...safe } = updated as any
  return { user: safe }
})
