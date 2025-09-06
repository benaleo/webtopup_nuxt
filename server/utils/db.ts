import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance in dev (HMR) and prod
let _db: PrismaClient | null = null

const db = (): PrismaClient => {
  if (_db) return _db
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
  _db = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  })
  return _db
}

export { db }