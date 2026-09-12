import { Request, Response, NextFunction } from 'express';
import { db, AnalyticsEvent } from '../db/database';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting map
const ipRateLimits = new Map<string, RateLimitRecord>();

// Clean up stale rate limits every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateLimits.entries()) {
    if (now > record.resetAt) {
      ipRateLimits.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * IP Rate limiter middleware (e.g. 100 requests per 15 minutes for standard APIs, 20 for auth/contact)
 */
export const createRateLimiter = (options: { maxRequests: number; windowMs: number; message?: string }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = ipRateLimits.get(ip) || { count: 0, resetAt: now + options.windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + options.windowMs;
    }

    record.count += 1;
    ipRateLimits.set(ip, record);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.maxRequests - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > options.maxRequests) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: options.message || 'You have exceeded the rate limit. Please try again later.',
        retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
      });
      return;
    }

    next();
  };
};

/**
 * Telemetry and Analytics Request Logger
 */
export const analyticsLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Only log API requests or page loads
    if (req.path.startsWith('/api/') && req.path !== '/api/health') {
      const event: AnalyticsEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        eventName: `${req.method} ${req.path}`,
        page: req.path,
        category: req.path.startsWith('/api/auth') ? 'auth' : req.path.startsWith('/api/files') ? 'interaction' : 'api',
        metadata: {
          method: req.method,
          statusCode: res.statusCode,
          durationMs,
          query: req.query,
        },
        ipAddress: ip.split(',')[0].trim(),
        userAgent,
        timestamp: new Date().toISOString(),
      };

      db.analytics.unshift(event);
      if (db.analytics.length > 500) db.analytics.pop();
      db.saveDiskAsync();
    }
  });

  next();
};
