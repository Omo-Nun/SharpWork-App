import { errorHandler, notFoundHandler } from '../middleware/errorHandler';

function mockResponse() {
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
  };
  return res;
}

describe('Error handlers', () => {
  it('notFoundHandler returns 404', () => {
    const res = mockResponse();
    notFoundHandler({} as never, res as never);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('errorHandler maps Paystack errors to 502', () => {
    const res = mockResponse();
    errorHandler(new Error('Paystack transfer failed'), {} as never, res as never, () => undefined);
    expect(res.statusCode).toBe(502);
    expect(res.body).toEqual({ error: 'Payment service is temporarily unavailable. Please try again.' });
  });

  it('errorHandler maps upload errors to 400', () => {
    const res = mockResponse();
    errorHandler(new Error('Upload file too large'), {} as never, res as never, () => undefined);
    expect(res.statusCode).toBe(400);
  });

  it('errorHandler returns generic 500 for unknown errors', () => {
    const res = mockResponse();
    errorHandler(new Error('Unexpected'), {} as never, res as never, () => undefined);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Something went wrong. Please try again later.' });
  });
});
