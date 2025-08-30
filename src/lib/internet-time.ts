const offsetCache = new Map<string, { offset: number; ts: number }>();
const OFFSET_TTL_MS = 5 * 60 * 1000; // 5 minutes

function resolveTimezone(tz?: string): string {
  return (
    tz ||
    process.env.DEFAULT_TZ ||
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

export async function fetchInternetTime(tz: string): Promise<Date> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  let res: Response;
  try {
    res = await fetch(`https://worldtimeapi.org/api/timezone/${tz}`, {
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request to worldtimeapi.org timed out`);
    }
    throw err;
  }
  clearTimeout(timeout);
  if (!res.ok) {
    let body: string;
    try {
      body = await res.text();
    } catch {
      body = "";
    }
    throw new Error(
      `Failed to fetch time for timezone ${tz}: ${res.status} ${res.statusText} ${body}`
    );
  }
  const data = await res.json();
  const networkDate = new Date(data.datetime);
  const deviceDate = new Date();
  const offset = networkDate.getTime() - deviceDate.getTime();
  offsetCache.set(tz, { offset, ts: Date.now() });
  return networkDate;
}

export async function getCurrentTime(tz?: string): Promise<Date> {
  const timezone = resolveTimezone(tz);
  const now = Date.now();
  const cache = offsetCache.get(timezone);
  if (!cache || now - cache.ts > OFFSET_TTL_MS) {
    try {
      await fetchInternetTime(timezone);
    } catch {
      return new Date();
    }
  }
  const offset = offsetCache.get(timezone)?.offset ?? 0;
  return new Date(Date.now() + offset);
}

export function __clearInternetTimeCache() {
  offsetCache.clear();
}

// Backwards compatibility for existing tests
export const __resetInternetTimeOffset = __clearInternetTimeCache;
