import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { uploadMedia } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const mediaFile = formData.get('media') as File;
    const type = formData.get('type') as 'image' | 'video';

    // Upload media to storage
    const mediaUrl = await uploadMedia(mediaFile, 'stories');

    // Create story
    const story = await prisma.story.create({
      data: {
        userId: session.user.id,
        mediaUrl,
        type,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Story creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get following users' stories
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            user: {
              followers: {
                some: {
                  followerId: session.user.id,
                },
              },
            },
          },
        ],
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Story fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
} 