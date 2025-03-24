import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import { serverConfig } from './config/server';
import { sslConfig } from './config/ssl';
import { MonitoringService } from './lib/monitoring';
import { BackupService } from './lib/backup';

const dev = serverConfig.nodeEnv !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    await app.prepare();

    const server = createServer(sslConfig, (req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    // Set up daily backups
    setInterval(() => {
      BackupService.createDatabaseBackup();
    }, 24 * 60 * 60 * 1000); // Every 24 hours

    server.listen(serverConfig.port, () => {
      console.log(`> Server running on https://localhost:${serverConfig.port}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    await MonitoringService.logError(error as Error, 'ServerStartup');
    process.exit(1);
  }
}

startServer(); 