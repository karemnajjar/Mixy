import { exec } from 'child_process';
import { promisify } from 'util';
import { uploadToS3 } from '@/lib/storage';

const execAsync = promisify(exec);

export class BackupService {
  static async createDatabaseBackup() {
    const timestamp = new Date().toISOString();
    const filename = `backup-${timestamp}.sql`;

    try {
      // Create database dump
      await execAsync(`pg_dump ${process.env.DATABASE_URL} > ${filename}`);

      // Upload to S3
      await uploadToS3(filename, 'backups');

      // Log successful backup
      await prisma.backupLog.create({
        data: {
          filename,
          status: 'SUCCESS',
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Backup failed:', error);
      // Alert admin
      await MonitoringService.sendAlertEmail({
        type: 'ERROR',
        message: 'Database backup failed',
        context: 'BackupService',
      });
    }
  }
} 