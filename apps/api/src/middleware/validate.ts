import { Request, Response, NextFunction } from 'express';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function sanitizeString(value: unknown, maxLength = 500): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

export function requireFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
      return;
    }

    next();
  };
}

export function validateEmail(req: Request, res: Response, next: NextFunction): void {
  const email = sanitizeString(req.body.email, 254);
  if (!email || !EMAIL_RE.test(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }
  req.body.email = email.toLowerCase();
  next();
}

export function validateUuidParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const raw = req.params[paramName];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || !UUID_RE.test(value)) {
      res.status(400).json({ error: `Invalid ${paramName}` });
      return;
    }
    next();
  };
}

export function clampNumber(value: unknown, min: number, max: number): number | null {
  const num = Number(value);
  if (!Number.isFinite(num) || num < min || num > max) return null;
  return num;
}
