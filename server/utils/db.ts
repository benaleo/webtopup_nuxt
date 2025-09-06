import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Ensure a single PrismaClient instance in dev (HMR) and prod
let _db: PrismaClient | null = null

const db = (): PrismaClient => {
  if (_db) return _db
  // Choose the right datasource URL based on environment
  // - In production on edge (e.g., Cloudflare Workers), use Prisma Accelerate URL (prisma://...)
  // - Locally/tools (db push), use DIRECT_DATABASE_URL (postgres://...)
  const accelUrl = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL

  const useAccelerate = typeof accelUrl === 'string' && accelUrl.startsWith('prisma://')
  const databaseUrl = useAccelerate ? accelUrl! : (directUrl as string | undefined)
  if (!databaseUrl) {
    throw new Error('Database URL is not configured. Set DATABASE_URL (prisma:// for Accelerate) or DIRECT_DATABASE_URL (postgres://).')
  }

  let client: PrismaClient = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  })

  if (useAccelerate) {
    // Cast extended client back to PrismaClient for typing convenience
    client = client.$extends(withAccelerate()) as unknown as PrismaClient
  }

  _db = client
  return _db
}

export { db }