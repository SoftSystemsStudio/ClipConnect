module.exports = {
  // Provide datasource config for Prisma v7 in CommonJS form
  datasources: {
    db: {
      provider: 'sqlite',
      // Prefer environment-provided URL in CI; fallback to local dev DB
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
}
