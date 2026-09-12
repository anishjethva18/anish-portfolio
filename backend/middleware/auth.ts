import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Require valid JWT authentication
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // Check Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
      message: 'Please provide a valid Bearer token in the Authorization header or auth cookie',
    });
    return;
  }

  const payload = authService.verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      message: 'Session has expired or token is invalid. Please log in again.',
    });
    return;
  }

  req.user = payload;
  next();
};

/**
 * Optional authentication: attach user if valid token exists, but don't reject if missing
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    const payload = authService.verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};

/**
 * Require Admin role
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({
        error: 'Forbidden: Admin access required',
        code: 'FORBIDDEN',
      });
      return;
    }
    next();
  });
};
