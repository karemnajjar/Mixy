import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

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
    const files = formData.getAll('files') as File[];
    const filter = formData.get('filter') as string;
    
    // Upload images to Cloudinary
    const uploadPromises = files.map(file =>
      uploadToCloudinary(file, {
        folder: 'posts',
        transformation: [{ effect: filter }]
      })
    );

    const uploadedImages = await Promise.all(uploadPromises);
    const imageUrls = uploadedImages.map(result => result.secure_url);

    // Create post in database
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        images: imageUrls,
        filter,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 