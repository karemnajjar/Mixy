import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all';
    const timeframe = searchParams.get('timeframe') || '24h';

    // Try to get cached results first
    const cacheKey = `trending:${type}:${timeframe}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return NextResponse.json(JSON.parse(cachedData));
    }

    const timeframeHours = {
      '24h': 24,
      '7d': 168,
      '30d': 720,
    }[timeframe] || 24;

    const date = new Date();
    date.setHours(date.getHours() - timeframeHours);

    let results: any = {};

    if (type === 'all' || type === 'hashtags') {
      // Get trending hashtags
      results.hashtags = await prisma.$queryRaw`
        SELECT 
          unnest(hashtags) as hashtag,
          COUNT(*) as count
        FROM (
          SELECT hashtags FROM "Post" WHERE "createdAt" > ${date}
          UNION ALL
          SELECT hashtags FROM "Clipz" WHERE "createdAt" > ${date}
        ) combined
        GROUP BY hashtag
        ORDER BY count DESC
        LIMIT 10
      `;
    }

    if (type === 'all' || type === 'users') {
      // Get trending users
      results.users = await prisma.user.findMany({
        where: {
          posts: {
            some: {
              createdAt: {
                gte: date,
              },
            },
          },
        },
        select: {
          id: true,
          username: true,
          name: true,
          image: true,
          _count: {
            select: {
              posts: true,
              followers: true,
            },
          },
        },
        orderBy: {
          followers: {
            _count: 'desc',
          },
        },
        take: 10,
      });
    }

    if (type === 'all' || type === 'clipz') {
      // Get trending clipz
      results.clipz = await prisma.clipz.findMany({
        where: {
          createdAt: {
            gte: date,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          likes: {
            _count: 'desc',
          },
        },
        take: 10,
      });
    }

    // Cache results
    await redis.setex(cacheKey, 3600, JSON.stringify(results)); // Cache for 1 hour

    return NextResponse.json(results);
  } catch (error) {
    console.error('Trending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 