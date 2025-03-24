import { prisma } from '@/lib/prisma';

export class MonitoringService {
  static async logError(error: Error, context: string) {
    await prisma.errorLog.create({
      data: {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date(),
      },
    });

    // Send alert to admin
    await this.sendAlertEmail({
      type: 'ERROR',
      message: error.message,
      context,
    });
  }

  static async sendAlertEmail(alert: {
    type: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    context: string;
  }) {
    // Send email to admin
    // Implementation here
  }

  static async trackPerformance(metric: {
    name: string;
    value: number;
    tags?: Record<string, string>;
  }) {
    await prisma.performanceMetric.create({
      data: {
        name: metric.name,
        value: metric.value,
        tags: metric.tags,
        timestamp: new Date(),
      },
    });
  }
} 