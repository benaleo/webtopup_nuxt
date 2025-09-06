import { tryGetAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await tryGetAuth(event)
  return { user: auth }
})
