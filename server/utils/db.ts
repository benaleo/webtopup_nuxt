import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

let _db: ReturnType<PrismaClient['$extends']> | null = null

const db = () => {
  if (_db) return _db
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
  const client = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  }).$extends(withAccelerate())
  _db = client
  return _db
}

export { db }