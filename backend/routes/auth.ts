import { Router, Response } from 'express';
import { authService } from '../services/authService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { createRateLimiter } from '../middleware/security';
import { db } from '../db/database';

export const authRouter = Router();

const authRateLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/**
 * POST /api/auth/register
 */
authRouter.post('/register', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const result = await authService.register(email, password, name || email.split('@')[0]);

    // Set HTTP-only cookie for secure refresh
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      user: result.user,
      tokens: result.tokens,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 */
authRouter.post('/login', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: result.user,
      tokens: result.tokens,
      message: 'Logged in successfully',
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = authService.getUserById(req.user.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ success: true, user });
});

/**
 * PUT /api/auth/profile
 */
authRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, bio, avatar, settings } = req.body;
    const updated = authService.updateUserProfile(req.user.userId, { name, bio, avatar, settings });

    res.json({
      success: true,
      user: updated,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Could not update profile' });
  }
});

/**
 * POST /api/auth/refresh
 */
authRouter.post('/refresh', (req: AuthenticatedRequest, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token is required' });
    return;
  }

  const payload = authService.verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
    return;
  }

  const user = db.users.get(payload.userId);
  if (!user) {
    res.status(404).json({ error: 'User no longer exists' });
    return;
  }

  const tokens = authService.generateTokens(user);
  res.json({ success: true, tokens });
});

/**
 * POST /api/auth/forgot-password
 */
authRouter.post('/forgot-password', authRateLimiter, (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const normalized = email.toLowerCase().trim();
  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === normalized);

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account matches that email address, password reset instructions have been dispatched.',
    simulationInfo: user
      ? `[Dev Note] Reset token generated for user ${user.name}. In production, an email with a 1-hour secure link is delivered.`
      : undefined,
  });
});
