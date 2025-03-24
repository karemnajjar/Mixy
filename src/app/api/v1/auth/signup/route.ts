import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import { sendAdminNotification } from '@/lib/email/adminNotifications';

export async function POST(req: Request) {
  try {
    const { email, password, username, name } = await req.json();

    // Validate input
    if (!email || !password || !username || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
        verificationToken: crypto.randomUUID(),
      },
    });

    // Store user information in a separate table for admin access
    await prisma.userLog.create({
      data: {
        userId: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        registrationIp: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    // Send verification email to user
    await sendVerificationEmail(user.email, user.verificationToken);

    // Send notification to admin
    await sendAdminNotification({
      email: user.email,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
    });

    return NextResponse.json({
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
} 