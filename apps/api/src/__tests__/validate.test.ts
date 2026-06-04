import { Request, Response, NextFunction } from 'express';
import {
  clampNumber,
  requireFields,
  sanitizeString,
  validateEmail,
  validateUuidParam,
} from '../middleware/validate';

function mockReqRes(body: Record<string, unknown> = {}, params: Record<string, string> = {}) {
  const req = { body, params } as Request;
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('Validation middleware helpers', () => {
  it('sanitizeString trims and rejects empty values', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('')).toBeNull();
    expect(sanitizeString(123)).toBeNull();
  });

  it('sanitizeString enforces max length', () => {
    expect(sanitizeString('a'.repeat(501), 500)).toBeNull();
  });

  it('clampNumber bounds numeric input', () => {
    expect(clampNumber(5, 1, 10)).toBe(5);
    expect(clampNumber(0, 1, 10)).toBeNull();
    expect(clampNumber('bad', 1, 10)).toBeNull();
  });

  it('requireFields rejects missing fields', () => {
    const { req, res, next } = mockReqRes({ email: 'a@b.com' });
    requireFields(['email', 'password'])(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('requireFields calls next when all fields present', () => {
    const { req, res, next } = mockReqRes({ email: 'a@b.com', password: 'secret' });
    requireFields(['email', 'password'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('validateEmail normalizes valid email', () => {
    const { req, res, next } = mockReqRes({ email: '  Test@Example.COM ' });
    validateEmail(req, res, next);
    expect(req.body.email).toBe('test@example.com');
    expect(next).toHaveBeenCalled();
  });

  it('validateEmail rejects invalid email', () => {
    const { req, res, next } = mockReqRes({ email: 'not-an-email' });
    validateEmail(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('validateUuidParam accepts valid UUID', () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const { req, res, next } = mockReqRes({}, { id });
    validateUuidParam('id')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('validateUuidParam rejects invalid UUID', () => {
    const { req, res, next } = mockReqRes({}, { id: 'bad-id' });
    validateUuidParam('id')(req, res, next);
    expect(res.statusCode).toBe(400);
  });
});
