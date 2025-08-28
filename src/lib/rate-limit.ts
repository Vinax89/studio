const DEFAULT_WINDOW_MS = 60_000;

interface Options {
  limit: number;
  windowMs?: number;
}

interface Hit {
  count: number;
  expires: number;
}

class SimpleLimiter {
  private hits = new Map<string, Hit>();
  constructor(private options: Options) {}

  check(key: string): boolean {
    const now = Date.now();
    const hit = this.hits.get(key);
    const windowMs = this.options.windowMs ?? DEFAULT_WINDOW_MS;
    if (hit && hit.expires > now) {
      if (hit.count >= this.options.limit) {
        return false;
      }
      hit.count += 1;
      return true;
    }
    this.hits.set(key, { count: 1, expires: now + windowMs });
    return true;
  }

  reset() {
    this.hits.clear();
  }
}

const ipLimiter = new SimpleLimiter({ limit: 5 });
const userLimiter = new SimpleLimiter({ limit: 10 });

export function checkRateLimit(req: Request): {
  allowed: boolean;
  reason?: 'ip' | 'user';
} {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  if (!ipLimiter.check(ip)) {
    return { allowed: false, reason: 'ip' };
  }
  const userId = req.headers.get('x-user-id');
  if (userId && !userLimiter.check(userId)) {
    return { allowed: false, reason: 'user' };
  }
  return { allowed: true };
}

// Helpers for tests
export function resetRateLimiters() {
  ipLimiter.reset();
  userLimiter.reset();
}
