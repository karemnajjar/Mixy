import crypto from 'crypto';
import { serialize, parse } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

export const CSRF_TOKEN_KEY = 'mixy-csrf-token';
export const MAX_AGE = 60 * 60 * 24 * 7; // 1 week

export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function setCSRFToken(res: NextApiResponse) {
  const token = generateCSRFToken();
  
  res.setHeader(
    'Set-Cookie',
    serialize(CSRF_TOKEN_KEY, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: MAX_AGE,
      path: '/',
    })
  );

  return token;
}

export function validateCSRFToken(req: NextApiRequest) {
  const cookies = parse(req.headers.cookie || '');
  const cookieToken = cookies[CSRF_TOKEN_KEY];
  const headerToken = req.headers['x-csrf-token'];

  return cookieToken && headerToken && cookieToken === headerToken;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function rateLimit(limit: number, windowMs: number) {
  const requests = new Map();

  return function(ip: string): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    requests.forEach((timestamp, key) => {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    });

    // Get requests in current window
    const requestCount = (requests.get(ip) || [])
      .filter(timestamp => timestamp > windowStart)
      .length;

    if (requestCount >= limit) {
      return false;
    }

    // Add current request
    const timestamps = requests.get(ip) || [];
    timestamps.push(now);
    requests.set(ip, timestamps);

    return true;
  };
} 