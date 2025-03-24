import { prisma } from '@/lib/prisma';
import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export class ModerationService {
  // Content Moderation
  static async moderateContent(content: string, type: 'text' | 'image') {
    if (type === 'text') {
      const response = await openai.createModeration({
        input: content,
      });

      const results = response.data.results[0];
      if (results.flagged) {
        await this.flagContent(content, 'text', results.categories);
        return false;
      }
    }

    return true;
  }

  // Report Handling
  static async handleReport(reporterId: string, contentId: string, reason: string) {
    await prisma.report.create({
      data: {
        reporterId,
        contentId,
        reason,
        status: 'PENDING',
      },
    });

    // Auto-moderate if multiple reports
    const reportCount = await prisma.report.count({
      where: {
        contentId,
        status: 'PENDING',
      },
    });

    if (reportCount >= 5) {
      await this.autoModerateContent(contentId);
    }
  }

  // Auto Moderation
  private static async autoModerateContent(contentId: string) {
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) return;

    const isSafe = await this.moderateContent(content.text, 'text');
    if (!isSafe) {
      await prisma.content.update({
        where: { id: contentId },
        data: { status: 'HIDDEN' },
      });
    }
  }

  // Flag Content
  private static async flagContent(
    content: string,
    type: string,
    categories: any
  ) {
    await prisma.moderationFlag.create({
      data: {
        content,
        type,
        categories: categories as any,
        action: 'AUTO_FLAG',
      },
    });
  }
} 