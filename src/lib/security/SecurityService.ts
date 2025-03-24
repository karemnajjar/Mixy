import { Redis } from '@upstash/redis';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';
import { generateTOTP, verifyTOTP } from '@/lib/auth/totp';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export class SecurityService {
  // IP Blocking
  static async trackIP(ip: string, action: 'login' | 'signup' | 'content') {
    const key = `ip:${ip}:${action}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 3600); // Reset after 1 hour

    if (attempts > 10) {
      await this.blockIP(ip);
      throw new Error('Too many attempts. IP blocked temporarily');
    }
  }

  static async blockIP(ip: string) {
    await redis.set(`blocked:${ip}`, true, { ex: 3600 }); // Block for 1 hour
    await prisma.securityLog.create({
      data: {
        type: 'IP_BLOCK',
        ip,
        details: 'Excessive attempts',
      },
    });
  }

  // 2FA
  static async enable2FA(userId: string) {
    const secret = generateTOTP();
    await prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorSecret: secret,
        twoFactorEnabled: true 
      },
    });
    return secret;
  }

  static async verify2FA(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });
    return verifyTOTP(code, user?.twoFactorSecret || '');
  }

  // Content Security
  static async scanContent(content: string) {
    const profanityRegex = /bad|words|here/gi; // Example
    const hasInappropriateContent = profanityRegex.test(content);
    
    if (hasInappropriateContent) {
      await prisma.securityLog.create({
        data: {
          type: 'CONTENT_VIOLATION',
          details: 'Inappropriate content detected',
          content,
        },
      });
      return false;
    }
    return true;
  }

  // Account Security
  static async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    const isValid = await compare(oldPassword, user?.password || '');
    if (!isValid) throw new Error('Invalid current password');

    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
} 