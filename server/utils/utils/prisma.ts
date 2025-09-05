import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Use Edge client with Accelerate so it runs on Cloudflare Workers.
// In Node/dev it also works, though without Node pooling.
// PRISMA_ACCELERATE_URL must be set in production.
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

export const db = prisma.$extends(withAccelerate())