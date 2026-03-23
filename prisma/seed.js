// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...')

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'mogesshitaw7702@gmail.com' },
    update: {
      passwordHash: hashedPassword,
      fullName: 'Moges Shitaw',
      role: 'admin',
      isActive: true,
      emailVerified: true
    },
    create: {
      email: 'mogesshitaw7702@gmail.com',
      passwordHash: hashedPassword,
      fullName: 'Moges Shitaw',
      role: 'admin',
      isActive: true,
      emailVerified: true
    }
  })

  console.log('✅ Admin user created:', adminUser.email)
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })