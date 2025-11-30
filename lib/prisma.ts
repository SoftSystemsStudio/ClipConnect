import { PrismaClient } from '@prisma/client'

declare global {
  // allow global prisma across HMR in development
   
  var prisma: PrismaClient | undefined
}

// Build options dynamically so Prisma v7 (which may require passing
// datasources/options) works in CI while remaining compatible with v4.
const clientOptions: any = {}
if (process.env.DATABASE_URL) {
  clientOptions.datasources = { db: { url: process.env.DATABASE_URL } }
}

// Ensure a compatible engine type for Prisma client in test/dev environments.
// Prisma v7 may default to engine type 'client' which requires additional options;
// prefer the binary engine for local tests unless explicitly overridden.
if (!clientOptions.engine) {
  clientOptions.engine = { type: process.env.PRISMA_CLIENT_ENGINE_TYPE || 'binary' }
}

const prisma = global.prisma || new PrismaClient(clientOptions)
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
