let offsetMs: number | null = null;

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
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === "AbortError") {
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
  offsetMs = networkDate.getTime() - deviceDate.getTime();
  return networkDate;
}

export async function getCurrentTime(tz?: string): Promise<Date> {
  if (offsetMs === null) {
    try {
      await fetchInternetTime(resolveTimezone(tz));
    } catch {
      return new Date();
    }
  }
  return new Date(Date.now() + (offsetMs ?? 0));
}

export function __resetInternetTimeOffset() {
  offsetMs = null;
}
