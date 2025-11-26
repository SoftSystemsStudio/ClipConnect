# ClipConnect (MVP)

This workspace contains a starter MVP for ClipConnect: a Next.js + TypeScript app with Prisma (SQLite) for local development.

Quick start (dev):

1. Install dependencies

```bash
npm install
```

2. Create `.env` in `prisma/` with:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-secret"
```

3. Generate Prisma client and run migrations & seed

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Start dev server

```bash
npm run dev
```

Open http://localhost:3000

# Notes
- This is a minimal scaffold to get started. It includes basic auth endpoints, simple explore page, and Prisma schema with required models. Continue iterating on UI, API, and seed data.
- Development uses SQLite by default (`prisma/.env` DATABASE_URL). For production, switch to PostgreSQL and migrate JSON/string fields accordingly.
- For local dev CORS is permissive; add stricter CORS rules in `pages/api/*` handlers for production.
# ClipConnect