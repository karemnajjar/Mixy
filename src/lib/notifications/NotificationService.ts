import { prisma } from '@/lib/prisma';
import { io } from '@/lib/websocket';

export class NotificationService {
  static async create(data: {
    userId: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    actorId: string;
    postId?: string;
    commentId?: string;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          actorId: data.actorId,
          postId: data.postId,
          commentId: data.commentId,
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      // Send real-time notification
      io.to(`user:${data.userId}`).emit('new_notification', notification);

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
      throw error;
    }
  }

  static async markAsRead(userId: string, notificationIds: string[]) {
    return prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId,
      },
      data: {
        read: true,
      },
    });
  }
} 