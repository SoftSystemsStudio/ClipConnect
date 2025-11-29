# Copilot Instructions — Examples & Templates

This companion file contains concrete examples and small templates referenced from `.github/copilot-instructions.md`.

## CLI / Quick-start commands (local dev)
Copy these into your terminal from the repo root.

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

## Minimal `prisma/schema.prisma` excerpt
Use as a starting point; expand fields as needed.

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

## Example Next.js API route (`pages/api/auth/register.ts`)
Demonstrates validation, Prisma usage, and a consistent JSON error envelope. Adapt to `lib/prisma.ts` and your auth helpers.

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

---

These examples are intentionally small and opinionated — copy them into the repo where appropriate (e.g., `prisma/schema.prisma` and `pages/api/auth/register.ts`) and expand to match your exact business rules and middlewares.
