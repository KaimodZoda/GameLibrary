import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function updateAdminPassword() {
  console.log('Updating admin password...')
  
  try {
    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@gamelibrary.com' }
    })

    if (!admin) {
      console.log('Admin user not found. Creating new admin user...')
      
      // Create admin if it doesn't exist
      const adminPassword = 'GameLibrary@2024!'
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@gamelibrary.com',
          password: hashedPassword,
          name: 'Admin User',
          role: UserRole.ADMIN
        }
      })
      
      console.log('Created new admin user:', newAdmin.email)
      console.log('Admin password:', adminPassword)
    } else {
      // Update existing admin password
      const newAdminPassword = 'GameLibrary@2024!'
      const hashedPassword = await bcrypt.hash(newAdminPassword, 12)
      
      const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@gamelibrary.com' },
        data: {
          password: hashedPassword,
          role: UserRole.ADMIN
        }
      })
      
      console.log('Updated admin user:', updatedAdmin.email)
      console.log('New admin password:', newAdminPassword)
    }
    
    console.log('Admin password update completed!')
    
  } catch (error) {
    console.error('Error updating admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAdminPassword()
