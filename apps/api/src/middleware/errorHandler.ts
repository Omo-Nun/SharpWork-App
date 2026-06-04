import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[API Error]', err);

  if (process.env.SENTRY_DSN) {
    try {
      const { Sentry } = require('../lib/sentry');
      Sentry.captureException(err);
    } catch {
      // Sentry optional
    }
  }

  if (err.message.includes('Paystack') || err.message.includes('escrow')) {
    res.status(502).json({ error: 'Payment service is temporarily unavailable. Please try again.' });
    return;
  }

  if (err.message.includes('Upload') || err.message.includes('file')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Resource not found' });
}
