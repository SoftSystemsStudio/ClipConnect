import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a few users: pros and clients
  const pro1 = await prisma.user.create({
    data: {
      email: 'pro1@example.com',
      passwordHash: 'password',
      name: 'Marcus Barber',
      role: 'PRO',
      profilePhotoUrl: null,
      professional: {
        create: {
          bio: 'Master barber specializing in fades and tapers.',
          specialties: JSON.stringify(['fade','taper']),
          hairTypesServed: JSON.stringify(['straight','wavy']),
          priceRange: '$30-$60',
          shopName: 'Clip Studio',
          experienceYears: 8,
          certifications: JSON.stringify([])
        }
      }
    }
  })

  const client1 = await prisma.user.create({
    data: {
      email: 'client1@example.com',
      passwordHash: 'password',
      name: 'Alex Client',
      role: 'CLIENT',
      client: {
        create: {
          hairTypes: JSON.stringify(['wavy']),
          usualStyles: JSON.stringify(['fade']),
          defaultCity: 'San Francisco',
          haircutProfilePhotos: JSON.stringify([])
        }
      }
    }
  })

  await prisma.post.createMany({
    data: [
      {
        professionalId: pro1.id,
        mediaUrls: JSON.stringify(['/uploads/sample1.jpg']),
        caption: 'Clean skin fade',
        styleTags: JSON.stringify(['fade']),
        hairTypeTags: JSON.stringify(['wavy']),
        location: 'San Francisco'
      }
    ]
  }).catch(()=>{})

  console.log({pro1Id: pro1.id, client1Id: client1.id})
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
