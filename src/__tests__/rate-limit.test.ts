import { GET } from '@/app/api/hello/route';
import { resetRateLimiters } from '@/lib/rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimiters();
  });

  it('limits requests per IP', async () => {
    const makeReq = () =>
      new Request('http://localhost/api/hello', {
        headers: { 'x-forwarded-for': '1.1.1.1' },
      });

    for (let i = 0; i < 5; i++) {
      const res = await GET(makeReq());
      expect(res.status).toBe(200);
    }
    const blocked = await GET(makeReq());
    expect(blocked.status).toBe(429);
  });

  it('limits requests per user', async () => {
    const makeReq = (ip: string) =>
      new Request('http://localhost/api/hello', {
        headers: {
          'x-forwarded-for': ip,
          'x-user-id': 'user-1',
        },
      });

    for (let i = 0; i < 10; i++) {
      const res = await GET(makeReq(`2.2.2.${i}`));
      expect(res.status).toBe(200);
    }
    const blocked = await GET(makeReq('2.2.2.100'));
    expect(blocked.status).toBe(429);
  });
});
