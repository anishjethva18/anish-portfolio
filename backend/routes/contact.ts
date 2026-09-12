import { Router, Request, Response } from 'express';
import { contactRateLimiter } from '../middleware/rateLimiter';
import { validateContactInput } from '../middleware/validation';
import { emailService, contactDb } from '../services/emailService';
import { getEmailConfig } from '../config/emailConfig';

const router = Router();

/**
 * POST /api/contact
 * Primary contact form submission endpoint
 */
router.post(
  ['/', ''],
  contactRateLimiter,
  validateContactInput,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await emailService.handleContactSubmission(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('[Contact Route] Unhandled exception:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while processing your message. Please try again later.',
      });
    }
  }
);

/**
 * GET /api/contact/health
 * Checks contact service status, active email provider, and configuration
 */
router.get('/health', (req: Request, res: Response): void => {
  const config = getEmailConfig();
  res.json({
    status: 'online',
    provider: config.provider,
    receiverEmail: config.receiverEmail,
    totalMessagesStored: contactDb.getCount(),
    diagnostics: config.diagnosticDetails,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/contact/history
 * Returns the recent submitted messages stored in portfolio database
 */
router.get('/history', (req: Request, res: Response): void => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const messages = contactDb.getAll();
  res.json({
    success: true,
    count: messages.length,
    messages,
  });
});

export default router;
