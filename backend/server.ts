import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import contactRouter from './routes/contact';
import { browseRouter } from './routes/browse';
import { filesRouter } from './routes/files';
import { profileRouter } from './routes/profile';
import { authRouter } from './routes/auth';
import { tasksRouter } from './routes/tasks';
import { analyticsRouter } from './routes/analytics';
import { docsRouter } from './routes/docs';
import { analyticsLogger } from './middleware/security';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for rate limiting behind Cloud Run / reverse proxies
  app.set('trust proxy', true);

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Cookie parser for JWT session cookies
  app.use(cookieParser());

  // Body parser middleware (support media and photo data URLs)
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Telemetry and request logging
  app.use(analyticsLogger);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Windows 11 OS Portfolio Server',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Mount backend API routers
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/docs', docsRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/browse', browseRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/profile', profileRouter);

  // Global API error handler for any uncaught /api/ errors (returns JSON instead of HTML)
  app.use('/api', (err: any, req: any, res: any, next: any) => {
    console.error('[Global API Error Handler]:', err);
    res.status(err.status || err.statusCode || 500).json({
      success: false,
      error: err.name || 'InternalServerError',
      message: err.message || 'An unexpected error occurred on the server.',
    });
  });

  // Serve static assets from public folder and persistent uploads folder
  app.use(express.static(path.join(process.cwd(), 'frontend/public')));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Vite middleware for development & SPA serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Windows 11 Portfolio Server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
