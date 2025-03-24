import { NextRequest } from 'next/server';
import { createRequestLogger } from '@/lib/logger';
import { createRateLimiter } from '@/lib/rateLimit';
import { errorHandler } from '@/middleware/errorHandler';
import { ValidationError } from '@/lib/errors';

// Create middleware instances
const loggerMiddleware = createRequestLogger();
const rateLimiter = createRateLimiter({
  limit: 100,
  window: '1h',
  keyPrefix: 'posts',
});

// Middleware chain helper
const withMiddleware = (handler: Function) => async (req: NextRequest) => {
  try {
    return await loggerMiddleware(req, async () => {
      return await rateLimiter(req, async () => {
        return await handler(req);
      });
    });
  } catch (error) {
    return errorHandler(error as Error, req);
  }
};

export const GET = withMiddleware(async (req: NextRequest) => {
  // Implementation...
});

export const POST = withMiddleware(async (req: NextRequest) => {
  // Validate request body
  const body = await req.json();
  const errors: Record<string, string[]> = {};

  if (!body.caption?.trim()) {
    errors.caption = ['Caption is required'];
  }
  if (!body.files?.length) {
    errors.files = ['At least one image is required'];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  // Implementation...
}); 