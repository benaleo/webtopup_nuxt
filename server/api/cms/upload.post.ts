import { readMultipartFormData, defineEventHandler, createError, getRequestURL } from 'h3'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, extname } from 'node:path'

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event)
  if (!form || form.length === 0) {
    throw createError({ statusCode: 400, message: 'No file uploaded' })
  }
  // h3 marks file parts by presence of `filename` and `data` (Buffer)
  const filePart = form.find(p => p.filename && p.data)
  if (!filePart || !filePart.filename || !filePart.data || filePart.data.length === 0) {
    throw createError({ statusCode: 400, message: 'Invalid file part' })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true })
  }

  const ext = extname(filePart.filename)
  const safeExt = ext.toLowerCase() || '.bin'
  const fname = `${Date.now()}_${Math.random().toString(36).slice(2)}${safeExt}`
  const relPath = `/uploads/${fname}`
  const absPath = join(uploadsDir, fname)

  await writeFile(absPath, filePart.data)

  return { path: relPath, filename: fname }
})
