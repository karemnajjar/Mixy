import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = 'admin123'; // Change this!
  const hashedPassword = await hash(adminPassword, 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'karemnajjartunisian@gmail.com',
      name: 'Admin',
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      emailVerified: new Date(),
    },
  });

  console.log('Admin user created:', admin);

  // Create initial settings
  await prisma.settings.create({
    data: {
      maintenanceMode: false,
      allowSignups: true,
      requireEmailVerification: true,
    },
  });

  console.log('Initial settings created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 