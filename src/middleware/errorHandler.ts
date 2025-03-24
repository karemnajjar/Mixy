import { NextRequest, NextResponse } from 'next/server';
import { AppError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function errorHandler(
  error: Error,
  req: NextRequest
): Promise<NextResponse> {
  // Log the error
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
  });

  // Handle operational errors
  if (error instanceof AppError) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Validation failed',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  // Handle programming or unknown errors
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }

  // Production error response
  return NextResponse.json(
    {
      status: 'error',
      message: 'Something went wrong',
    },
    { status: 500 }
  );
} 