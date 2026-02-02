import { PrismaClient } from '@prisma/client/index.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

  const adapter = new PrismaLibSql({
    url: dbUrl,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
