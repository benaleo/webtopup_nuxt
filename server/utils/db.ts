import { PrismaClient } from '@prisma/client'

// Ensure a single PrismaClient instance in dev (HMR) and prod
let _db: PrismaClient | null = null

const db = (): PrismaClient => {
  if (_db) return _db
  // Prefer DIRECT_DATABASE_URL (used by prisma db push) to avoid env mismatch,
  // fallback to DATABASE_URL if DIRECT is not set.
  const databaseUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
  _db = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  })
  return _db
}

export { db }