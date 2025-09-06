import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const browser = String(body?.browser || 'Unknown')
    const os = String(body?.os || 'Unknown')
    const url = String(body?.url || '')

    const ip = getRequestIP(event, { xForwardedFor: true }) || undefined
    // Country could be provided by a proxy header like CF-IPCountry or x-country; fallback to undefined
    const country = getHeader(event, 'cf-ipcountry') || getHeader(event, 'x-country') || undefined

    const item = await db.logTrafic.create({
      data: {
        browser,
        os,
        url,
        ip,
        country,
      },
    })

    return { success: true, item }
  } catch (e: any) {
    // Do not fail the client harshly for traffic logging; return 200 with success false
    return { success: false, message: e?.message || 'failed' }
  }
})
