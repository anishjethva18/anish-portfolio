import { Router, Request, Response } from 'express';
import { db, AnalyticsEvent } from '../db/database';
import os from 'os';

export const analyticsRouter = Router();

/**
 * GET /api/analytics/dashboard
 */
analyticsRouter.get('/dashboard', (req: Request, res: Response) => {
  const totalEvents = db.analytics.length;
  const recentEvents = db.analytics.slice(0, 50);

  // Group by category
  const categoryCounts: Record<string, number> = {};
  db.analytics.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  // Calculate average response time
  let totalDuration = 0;
  let durationCount = 0;
  db.analytics.forEach((e) => {
    if (e.metadata?.durationMs) {
      totalDuration += e.metadata.durationMs;
      durationCount++;
    }
  });

  const avgLatencyMs = durationCount > 0 ? Math.round(totalDuration / durationCount) : 12;

  // Contact messages count
  const contactsCount = db.contacts.size;
  const usersCount = db.users.size;
  const tasksCount = db.tasks.size;

  // System stats
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const freeMem = Math.round(os.freemem() / 1024 / 1024);
  const usedMem = totalMem - freeMem;
  const uptimeSeconds = Math.round(os.uptime());

  res.json({
    success: true,
    metrics: {
      totalRequests: totalEvents,
      avgLatencyMs,
      errorRatePercent: 0.2,
      activeUsers: usersCount,
      contactsCount,
      tasksCount,
      categoryDistribution: categoryCounts,
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        totalMb: totalMem,
        usedMb: usedMem,
        freeMb: freeMem,
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      uptimeSeconds,
      nodeVersion: process.version,
    },
    recentEvents,
  });
});

/**
 * POST /api/analytics/track
 */
analyticsRouter.post('/track', (req: Request, res: Response) => {
  const { eventName, category, metadata, page } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  if (!eventName) {
    res.status(400).json({ error: 'eventName is required' });
    return;
  }

  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    eventName,
    page: page || '/',
    category: category || 'interaction',
    metadata: metadata || {},
    ipAddress: ip.split(',')[0].trim(),
    userAgent,
    timestamp: new Date().toISOString(),
  };

  db.analytics.unshift(event);
  if (db.analytics.length > 500) db.analytics.pop();

  res.status(201).json({ success: true, eventId: event.id });
});

/**
 * GET /api/analytics/logs
 */
analyticsRouter.get('/logs', (req: Request, res: Response) => {
  res.json({
    success: true,
    logs: db.analytics.slice(0, 100),
  });
});
