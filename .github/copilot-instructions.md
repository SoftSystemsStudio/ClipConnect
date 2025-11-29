```instructions
**Project Overview**

ClipConnect is a visual-first marketplace connecting grooming professionals (barbers, stylists, braiders, colorists) with clients. The repo follows a full-stack approach: a React + TypeScript frontend and a Node.js backend with a relational database (Postgres recommended). This file gives AI agents the minimal, high-value context and conventions needed to be productive immediately.

**Architecture & Key Areas**
- **Frontend**: expect a Next.js or CRA app under `frontend/` or `apps/web/` with `src/pages` or `src/app`, `src/components`, `src/styles`.
- **Backend / API**: expect a Node.js service under `backend/`, `api/`, or `apps/api/` exposing REST endpoints (e.g. `/api/auth`, `/api/pros`, `/api/posts`, `/api/search`). Keep auth and data-access logic in `routes/`, `controllers/`, `services/`, and `db/` (or `lib/prisma`).
- **DB & ORM**: prefer PostgreSQL with Prisma (look for `prisma/schema.prisma`) or Sequelize/TypeORM. Seed scripts should live under `prisma/seed.ts` or `scripts/seed.ts`.

**Important Data Models (use these exact names when possible)**
- `User` (fields: `id`, `role`, `email`, `passwordHash`, `name`, `profilePhotoUrl`, `location`, `createdAt`, `updatedAt`)
- `ProfessionalProfile` (1:1 to `User` when `role = PRO`)
- `ClientProfile` (1:1 to `User` when `role = CLIENT`)
- `Post` (portfolio item)
- `ToolProduct` (affiliate items)
- `Review`, `Follow`, `SavedItem`

When adding or editing models, preserve these names to keep frontend/backend wiring predictable.

**Auth & Onboarding Conventions**
- Use email/password or magic link. Place auth routes under `api/auth` and middleware in `middleware/auth.ts` or `lib/auth.ts`.
- Sign-up must capture `role` (PRO/CLIENT) and route new users to role-specific onboarding pages: `onboarding/pro` and `onboarding/client` (or `pages/onboarding/pro.tsx`).

**API Patterns & Error Handling**
- Keep endpoints RESTful and idempotent where possible: `GET /api/pros/:id`, `POST /api/posts`, `PUT /api/profiles/:id`.
- Use consistent HTTP status codes and JSON error envelopes, e.g. `{ error: { code: 'VALIDATION_FAILED', message: '...' } }`.
- Protect write routes with auth middleware; validate ownership (e.g., only the pro can edit their `ProfessionalProfile`).

**Search & Discovery**
- Implement a filterable `GET /api/search` that accepts query params: `city`, `zip`, `radius`, `styleTags`, `hairTypes`, `minRating`, `priceMin`, `priceMax`.
- Keep search logic simple in MVP (DB queries + basic text/tag indexes). Document SQL or Prisma queries in code comments.

**Duration & Estimation Fields**
- Include the haircut duration fields in models as specified: `minCutDurationMinutes`, `maxCutDurationMinutes`, `estimatedDurationMinutes`, `typicalCutDurationMinutes`, and `actualDurationMinutes` on reviews. Compute client averages in a background-safe helper `lib/durations.ts`.

**Frontend Conventions**
- React + TypeScript preferred. Components under `src/components` and pages under `src/pages` or `src/app`.
- UI primitives: `Card`, `Avatar`, `Tag`, `Rating`, `MediaGrid`, `SearchFilters` — keep these reusable and present in `src/components/ui/`.
- Keep data fetching colocated with pages using `getServerSideProps` or `useEffect` + `fetch` depending on framework choice.

**Seed Data & Dev Commands (local dev expectations)**
- Expect these scripts to exist or add them: `scripts/dev`, `scripts/start`, `scripts/seed`.
- Typical local commands to include in `README.md`:
  - `pnpm install` (or `npm install`)
  - `pnpm --filter api install && pnpm --filter web install` (monorepo) or `cd backend && pnpm install`
  - `pnpm prisma migrate dev --name init` and `pnpm prisma db seed` (if using Prisma)
  - `pnpm dev` (starts frontend + backend in dev mode)

**Testing & Lints**
- Unit tests: place under `__tests__` or `tests/`; prefer Jest + React Testing Library for frontend and supertest + Jest for API endpoints.
- Provide `pnpm test` and `pnpm lint` scripts.

**File/Code Patterns to Watch For**
- Reusable types in `shared/` or `packages/types` (e.g., `types/User.ts`).
- Keep business rules (rating calculation, duration averaging, affiliate click increment) in small pure helpers under `lib/` so tests are straightforward.

**Where to Add Seed Content**
- Add sample professionals, posts, and reviews in `prisma/seed.ts` or `scripts/seed.ts`. Seed at least 8–10 pros and 20–30 posts covering multiple cities and hair types.

**PR & Commit Guidance for Agents**
- Keep PRs focused: one feature or one bug fix per PR. Use descriptive titles: `feat(api): add search filters for hair types`.
- Add a short description and list of file changes. If adding seed data, include how to re-seed locally.

**If You Can’t Find a File**
- If expected files (e.g., `prisma/`, `frontend/`, `backend/`) aren't present, create a minimal layout before implementing features; document the layout in `README.md`.

**Questions To Ask the Human Before Making Large Changes**
- Preferred database (Postgres vs SQLite for dev).
- Monorepo vs two-repo structure preference.
- Preferred package manager (`pnpm`/`yarn`/`npm`).

Please review this and tell me which parts to expand (examples, CLI commands, or exact file templates). I will iterate based on your feedback.

```

**Examples & Templates**

- **CLI / Quick-start commands (local dev)**: copy these into your terminal from the repo root.

```bash
# install dependencies (choose your package manager)
pnpm install    # or `npm install` / `yarn install`

# run prisma migrations (Postgres dev) and seed
pnpm prisma migrate dev --name init
pnpm prisma db seed

# run frontend + backend (monorepo) or single app
pnpm dev

# run tests and lint
pnpm test
pnpm lint
```

- **Minimal `prisma/schema.prisma` excerpt** (use as a starting point; expand fields as needed):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  passwordHash     String?
  name             String?
  role             String
  profilePhotoUrl  String?
  location         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  professional     ProfessionalProfile?
  clientProfile    ClientProfile?
  posts            Post[]
  reviews          Review[]
}

model ProfessionalProfile {
  id        String @id @default(cuid())
  user      User   @relation(fields: [userId], references: [id])
  userId    String @unique
  bio       String?
  tags      String[] @default([])
}

model Post {
  id         String   @id @default(cuid())
  pro        User     @relation(fields: [proId], references: [id])
  proId      String
  title      String
  mediaUrls  String[] @default([])
  createdAt  DateTime @default(now())
}

model Review {
  id                     String   @id @default(cuid())
  post                   Post?    @relation(fields: [postId], references: [id])
  postId                 String?
  author                 User     @relation(fields: [authorId], references: [id])
  authorId               String
  rating                 Int
  actualDurationMinutes  Int?
  createdAt              DateTime @default(now())
}
```

- **Example Next.js API route** (`pages/api/auth/register.ts`) — demonstrates validation, Prisma usage, and a consistent JSON error envelope. Adapt to `lib/prisma.ts` and your auth helpers.

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import prisma from '../../lib/prisma'

type Data = { data?: any; error?: { code: string; message: string } }

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== 'POST') return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } })

  const { email, password, name, role } = req.body
  if (!email || !password || !role) {
    return res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'email, password and role are required' } })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: { code: 'ALREADY_EXISTS', message: 'User already exists' } })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, passwordHash, name, role } })
    return res.status(201).json({ data: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } })
  }
}
```

These examples are intentionally small and opinionated — they should be copied into the repo where appropriate (e.g., `prisma/schema.prisma` and `pages/api/auth/register.ts`) and expanded to match your exact business rules and middlewares.
