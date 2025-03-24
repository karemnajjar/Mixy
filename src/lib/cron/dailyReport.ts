import { prisma } from '@/lib/prisma';
import { sendAdminNotification } from '@/lib/email/adminNotifications';

export async function sendDailyUserReport() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const newUsers = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: yesterday,
      },
    },
    include: {
      userLogs: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const reportContent = {
    totalNewUsers: newUsers.length,
    users: newUsers.map(user => ({
      email: user.email,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
      registrationIp: user.userLogs[0]?.registrationIp,
    })),
  };

  await sendAdminNotification({
    ...reportContent,
    subject: 'Daily User Registration Report',
  });
} 