import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Single Prisma client instance for both Edge (Workers) and local dev.
// - On Workers, DATABASE_URL must be an Accelerate URL (prisma://...)
// - Locally, it can be postgres:// (works with the Edge client too)
const datasourceUrl = process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL
if (!datasourceUrl) {
  throw new Error('DATABASE_URL (or DIRECT_DATABASE_URL) is not set')
}

const prisma = new PrismaClient({ datasourceUrl })

// Export unified client as `db`
export const db = prisma.$extends(withAccelerate())