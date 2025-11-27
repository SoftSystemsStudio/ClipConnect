# Prisma v7 Migration Plan (draft)

Goal
----
Migrate the project from Prisma v4 to Prisma v7 with minimal downtime and clear, testable steps.

Why
---
- Keep dependencies up-to-date (security, features).
- Align with other major upgrades already applied (Next 16 / React 19).

High-level steps
----------------
1. Create a feature branch `feat/prisma-v7-migration`.
2. Update `package.json` to use `prisma@^7` and `@prisma/client@^7` and run `npm install`.
3. Add `prisma.config.ts` (or `prisma.config.js`) with the v7 datasource shape. Prefer JS to avoid importing types during TS build.
4. Update `lib/prisma.ts` to construct `PrismaClient` with the v7 constructor options (pass adapter/connection configuration from `process.env.DATABASE_URL`).
5. Run `npx prisma generate --schema=prisma/schema.prisma` and address generator/runtime errors.
6. Run `npm run build` and `npm test` and fix any code issues.
7. Open a draft PR and iterate until CI is green.

Rollback plan
-------------
- If install/generate fails or migration blocks development, revert the branch and keep `main` on Prisma v4.

Notes & Risks
-------------
- The Prisma v7 CLI expects datasource configuration in `prisma.config.*`. Use JS if TypeScript import introduces build-time type issues.
- CI should validate `npx prisma generate`, `npm run build`, and tests.

Acceptance criteria
-------------------
- `npx prisma generate` succeeds locally on the migration branch.
- `npm run build` and `npm test` pass.
- Migration PR reviewed and merged.
