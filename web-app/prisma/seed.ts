import { PrismaClient, ReturnMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
  },
  {
    title: 'Mario Kart 8',
    platform: 'Nintendo Switch',
    genre: 'Racing',
    available: true,
    gradient: 'from-yellow-400 to-red-500'
  },
  {
    title: 'Minecraft',
    platform: 'PC',
    genre: 'Sandbox',
    available: true,
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    title: 'Call of Duty',
    platform: 'PlayStation 5',
    genre: 'FPS',
    available: true,
    gradient: 'from-gray-400 to-gray-600'
  }
]

async function main() {
  console.log('Start seeding...')
  
  // Create admin user
  const adminPassword = 'GameLibrary@2024!'
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gamelibrary.com' },
    update: {},
    create: {
      email: 'admin@gamelibrary.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  })
  console.log('Created admin user:', admin.email)
  console.log('Admin password:', adminPassword)
  
  // Create test user
  const userPassword = 'User123!'
  const hashedUserPassword = await bcrypt.hash(userPassword, 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'user@gamelibrary.com' },
    update: {},
    create: {
      email: 'user@gamelibrary.com',
      password: hashedUserPassword,
      name: 'Test User',
      role: 'USER'
    }
  })
  console.log('Created test user:', testUser.email)
  console.log('User password:', userPassword)
  
  // Create games
  const createdGames = []
  for (const game of games) {
    const createdGame = await prisma.game.create({
      data: game
    })
    createdGames.push(createdGame)
  }
  console.log(`Created ${createdGames.length} games`)
  
  // Create test loans with different statuses
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  // Loan 1: Borrow Pending (waiting for admin approval)
  const loan1 = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[0].id, // Zelda
      dateBorrowed: today,
      dueDate: nextWeek,
      status: 'pending'
    }
  })
  
  // Loan 2: Borrow Approved (admin approved, user can pick up)
  const loan2 = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[1].id, // Elden Ring
      dateBorrowed: yesterday,
      dueDate: nextWeek,
      status: 'approved',
      approvedAt: twoDaysAgo,
      approvedBy: admin.id
    }
  })
  
  // Loan 3: Active (user has the game)
  const loan3 = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[2].id, // FIFA 24
      dateBorrowed: threeDaysAgo,
      dueDate: nextWeek,
      status: 'picked_up',
      approvedAt: threeDaysAgo,
      approvedBy: admin.id,
      pickupDate: twoDaysAgo
    }
  })
  
  // Loan 3.5: Overdue (user has the game but due date has passed)
  const loanOverdue = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[6].id, // Use Call of Duty for overdue test
      dateBorrowed: lastWeek,
      dueDate: twoDaysAgo, // Due date in the past
      status: 'picked_up',
      approvedAt: lastWeek,
      approvedBy: admin.id,
      pickupDate: lastWeek
    }
  })
  
  // Loan 3: Active (user has the game) - No return request
  
  // Loan 4: Return Pending (user submitted return request)
  const loan4 = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[3].id, // Stardew Valley
      dateBorrowed: threeDaysAgo,
      dueDate: nextWeek,
      status: 'picked_up',
      approvedAt: threeDaysAgo,
      approvedBy: admin.id,
      pickupDate: threeDaysAgo
    }
  })
  
  // Create return request for loan 4
  const return1 = await prisma.return.create({
    data: {
      loanId: loan4.id,
      status: 'pending',
      returnMethod: ReturnMethod.IN_PERSON,
      returnNotes: 'Game is in good condition'
    }
  })
  
  // Loan 5: Returning (return approved, user returning game)
  const loan5 = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[4].id, // Mario Kart
      dateBorrowed: threeDaysAgo,
      dueDate: nextWeek,
      status: 'picked_up',
      approvedAt: threeDaysAgo,
      approvedBy: admin.id,
      pickupDate: threeDaysAgo
    }
  })
  
  // Create return request for loan 5
  const return2 = await prisma.return.create({
    data: {
      loanId: loan5.id,
      status: 'approved',
      approvedAt: yesterday,
      approvedBy: admin.id,
      returnMethod: ReturnMethod.DROP_BOX,
      trackingNumber: 'TRK123456',
      returnNotes: 'Will return via drop box'
    }
  })
  
  // Loan 6: Returned (fully completed)
  const loan6 = await prisma.loan.create({
    data: {
      userId: testUser.id,
      gameId: createdGames[5].id, // Minecraft
      dateBorrowed: threeDaysAgo,
      dueDate: nextWeek,
      status: 'returned',
      approvedAt: threeDaysAgo,
      approvedBy: admin.id,
      pickupDate: threeDaysAgo,
      completedAt: yesterday,
      completedBy: admin.id
    }
  })
  
  // Create completed return request for loan 6
  const return3 = await prisma.return.create({
    data: {
      loanId: loan6.id,
      status: 'completed',
      approvedAt: threeDaysAgo,
      approvedBy: admin.id,
      completedAt: yesterday,
      completedBy: admin.id,
      returnMethod: ReturnMethod.IN_PERSON,
      returnNotes: 'Game returned in excellent condition'
    }
  })
  
  // Create admin actions for return requests
  await prisma.adminAction.create({
    data: {
      returnId: return1.id,
      adminId: admin.id,
      action: 'return_approved',
      notes: 'Return request approved for loan1'
    }
  });

  await prisma.adminAction.create({
    data: {
      returnId: return2.id,
      adminId: admin.id,
      action: 'return_approved',
      notes: 'Return request approved for loan2'
    }
  });

  await prisma.adminAction.create({
    data: {
      returnId: return3.id,
      adminId: admin.id,
      action: 'return_approved',
      notes: 'Return request approved for loan3'
    }
  });
  
  console.log('Created 7 test loans with different statuses (including 1 overdue)')
  console.log('Created 2 return requests')
  console.log('Created 2 admin actions')
  
  // Update game availability
  await prisma.game.update({
    where: { id: createdGames[0].id },
    data: { available: false } // Zelda - pending
  })
  
  await prisma.game.update({
    where: { id: createdGames[1].id },
    data: { available: false } // Elden Ring - borrowed
  })
  
  await prisma.game.update({
    where: { id: createdGames[2].id },
    data: { available: false } // FIFA 24 - active
  })
  
  await prisma.game.update({
    where: { id: createdGames[3].id },
    data: { available: false } // Stardew Valley - return pending
  })
  
  await prisma.game.update({
    where: { id: createdGames[4].id },
    data: { available: false } // Mario Kart 8 - returning
  })
  
  await prisma.game.update({
    where: { id: createdGames[6].id },
    data: { available: false } // Call of Duty - overdue
  })
  
  console.log('Updated game availability')
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
