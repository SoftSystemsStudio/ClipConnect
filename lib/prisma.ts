import { PrismaClient } from '@prisma/client'

declare global {
  // allow global prisma across HMR in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Build options dynamically so Prisma v7 (which may require passing
// datasources/options) works in CI while remaining compatible with v4.
const clientOptions: any = {}
if (process.env.DATABASE_URL) {
  clientOptions.datasources = { db: { url: process.env.DATABASE_URL } }
}

const prisma = global.prisma || new PrismaClient(clientOptions)
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
