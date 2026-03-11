import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const games = [
  {
    title: 'The Legend of Zelda',
    platform: 'Nintendo Switch',
    genre: 'Action-Adventure',
    available: true,
    gradient: 'from-indigo-400 to-purple-500'
  },
  {
    title: 'Elden Ring',
    platform: 'PlayStation 5',
    genre: 'RPG',
    available: false,
    gradient: 'from-green-400 to-blue-500'
  },
  {
    title: 'FIFA 24',
    platform: 'Xbox Series X',
    genre: 'Sports',
    available: true,
    gradient: 'from-red-400 to-orange-500'
  },
  {
    title: 'Stardew Valley',
    platform: 'PC',
    genre: 'Simulation',
    available: true,
    gradient: 'from-purple-400 to-pink-500'
  }
]

async function main() {
  console.log('Start seeding...')
  
  for (const game of games) {
    await prisma.game.create({
      data: game
    })
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
