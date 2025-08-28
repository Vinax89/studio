let offsetMs: number | null = null;

function resolveTimezone(tz?: string): string {
  return (
    tz ||
    process.env.DEFAULT_TZ ||
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

export async function fetchInternetTime(tz: string): Promise<Date> {
  const res = await fetch(`https://worldtimeapi.org/api/timezone/${tz}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch time for timezone ${tz}`);
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
