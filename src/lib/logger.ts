import pino from 'pino';
import { NextRequest } from 'next/server';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'pid,hostname',
    translateTime: 'yyyy-mm-dd HH:MM:ss',
  },
});

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport,
});

export function logRequest(req: NextRequest, responseTime?: number) {
  const log = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers.get('user-agent'),
    responseTime,
  };

  logger.info(log, 'Incoming request');
}

export function logError(error: Error, req?: NextRequest) {
  const log = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: req
      ? {
          method: req.method,
          url: req.url,
          ip: req.ip,
        }
      : undefined,
  };

  logger.error(log, 'Error occurred');
}

export function createRequestLogger() {
  return async function loggerMiddleware(
    req: NextRequest,
    next: () => Promise<Response>
  ) {
    const start = Date.now();
    try {
      const response = await next();
      const responseTime = Date.now() - start;
      logRequest(req, responseTime);
      return response;
    } catch (error) {
      const responseTime = Date.now() - start;
      logError(error as Error, req);
      logRequest(req, responseTime);
      throw error;
    }
  };
} 