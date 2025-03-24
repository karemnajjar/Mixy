import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { processVideo } from '@/lib/videoProcessing';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '10');

    const clipz = await prisma.clipz.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        likes: true,
        comments: true,
        music: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const nextCursor = clipz[limit - 1]?.id;

    return NextResponse.json({
      clipz,
      nextCursor,
    });
  } catch (error) {
    console.error('Error fetching clipz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const caption = formData.get('caption') as string;
    const music = JSON.parse(formData.get('music') as string);
    const hashtags = JSON.parse(formData.get('hashtags') as string);

    // Process video (compress, generate thumbnail)
    const processedVideo = await processVideo(videoFile);

    // Upload to Cloudinary
    const [videoUpload, thumbnailUpload] = await Promise.all([
      uploadToCloudinary(processedVideo.video, {
        folder: 'mixy/clipz',
        resource_type: 'video',
      }),
      uploadToCloudinary(processedVideo.thumbnail, {
        folder: 'mixy/clipz/thumbnails',
      }),
    ]);

    // Create clipz in database
    const clipz = await prisma.clipz.create({
      data: {
        userId: session.user.id,
        videoUrl: videoUpload.secure_url,
        thumbnailUrl: thumbnailUpload.secure_url,
        caption,
        hashtags,
        music: {
          create: music,
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
        music: true,
      },
    });

    return NextResponse.json({ clipz });
  } catch (error) {
    console.error('Error creating clipz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 