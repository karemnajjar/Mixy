import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export class AnalyticsService {
  // User Engagement
  static async trackUserAction(userId: string, action: string, details: any) {
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        details,
      },
    });

    // Real-time metrics
    await redis.hincrby(`metrics:${action}`, 'count', 1);
  }

  // Content Performance
  static async trackContentView(contentId: string, userId: string) {
    await prisma.contentView.create({
      data: {
        contentId,
        userId,
        timestamp: new Date(),
      },
    });

    await redis.hincrby(`content:${contentId}:metrics`, 'views', 1);
  }

  // User Retention
  static async trackUserSession(userId: string) {
    const key = `user:${userId}:sessions`;
    await redis.lpush(key, new Date().toISOString());
    await redis.ltrim(key, 0, 29); // Keep last 30 sessions
  }

  // Generate Reports
  static async generateDailyReport() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [newUsers, activeUsers, contentViews] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      }),
      prisma.userActivity.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: yesterday,
          },
        },
      }),
      prisma.contentView.count({
        where: {
          timestamp: {
            gte: yesterday,
          },
        },
      }),
    ]);

    return {
      date: yesterday.toISOString(),
      metrics: {
        newUsers,
        activeUsers: activeUsers.length,
        contentViews,
      },
    };
  }
} 