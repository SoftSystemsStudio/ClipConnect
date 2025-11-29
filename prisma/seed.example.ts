import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Minimal example seeds: one PRO, one CLIENT, one Post
  const pro = await prisma.user.create({
    data: {
      email: 'pro.example@clipconnect.test',
      passwordHash: 'changeme',
      name: 'Example Pro',
      role: 'PRO',
      professional: { create: { bio: 'Example pro for local dev', tags: [] } }
    }
  })

  const client = await prisma.user.create({
    data: {
      email: 'client.example@clipconnect.test',
      passwordHash: 'changeme',
      name: 'Example Client',
      role: 'CLIENT',
      clientProfile: { create: {} }
    }
  })

  await prisma.post.create({
    data: {
      proId: pro.id,
      title: 'Example cut',
      mediaUrls: ['/uploads/example.jpg']
    }
  })

  console.log('Seeded example users and post')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
