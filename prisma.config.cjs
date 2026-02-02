const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },
});
