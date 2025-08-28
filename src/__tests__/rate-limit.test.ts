import { checkRateLimit, resetRateLimiters, SimpleLimiter } from '@/lib/rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimiters();
  });

  it('limits requests per IP', () => {
    const req = { headers: new Headers({ 'x-forwarded-for': '1.1.1.1' }) } as Request;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req).allowed).toBe(true);
    }
    expect(checkRateLimit(req).allowed).toBe(false);
  });

  it('limits requests per user', () => {
    const makeReq = (ip: string) =>
      ({
        headers: new Headers({
          'x-forwarded-for': ip,
          'x-user-id': 'user-1',
        }),
      } as Request);

    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(makeReq(`2.2.2.${i}`)).allowed).toBe(true);
    }
    expect(checkRateLimit(makeReq('2.2.2.100')).allowed).toBe(false);
  });

  it('prunes expired entries to bound memory', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const limiter = new SimpleLimiter({ limit: 1, windowMs: 1000 });
    for (let i = 0; i < 50; i++) {
      expect(limiter.check(`key-${i}`)).toBe(true);
    }
    expect(limiter.size).toBe(50);
    jest.advanceTimersByTime(1000);
    expect(limiter.check('another')).toBe(true);
    expect(limiter.size).toBe(1);
    jest.useRealTimers();
  });
});
