import { SignJWT, jwtVerify } from 'jose'
import { getCookie, setCookie, deleteCookie, H3Event } from 'h3'

const tokenName = 'auth_token'

function getSecret() {
  const cfg = useRuntimeConfig()
  const secret = (cfg as any).auth?.jwtSecret || process.env.JWT_SECRET || 'dev_secret_change_me'
  return new TextEncoder().encode(secret)
}

export async function setSession(event: H3Event, payload: Record<string, any>) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
  const prod = process.env.NODE_ENV === 'production'
  setCookie(event, tokenName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: prod,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSession(event: H3Event) {
  deleteCookie(event, tokenName, { path: '/' })
}

export async function requireAuth(event: H3Event) {
  const token = getCookie(event, tokenName)
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized' })
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid token' })
  }
}

export async function tryGetAuth(event: H3Event) {
  const token = getCookie(event, tokenName)
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload
  } catch {
    return null
  }
}
