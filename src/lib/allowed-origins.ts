export type AllowedOrigin = string | RegExp;

function parseItem(item: string): AllowedOrigin | null {
  const trimmed = item.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
    const pattern = trimmed.slice(1, -1);
    try {
      return new RegExp(pattern);
    } catch {
      return null;
    }
  }
  try {
    // Validate URL
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(env: string | undefined = process.env.ALLOWED_ORIGINS): AllowedOrigin[] {
  if (!env) return [];
  return env
    .split(',')
    .map(parseItem)
    .filter((item): item is AllowedOrigin => item !== null);
}

export const allowedOrigins: AllowedOrigin[] = getAllowedOrigins();

export function isAllowedOrigin(
  origin: string | null,
  origins: AllowedOrigin[] = allowedOrigins,
): boolean {
  if (origins.length === 0) return true
  if (!origin) return false
  return origins.some((item) =>
    typeof item === "string" ? item === origin : item.test(origin),
  )
}
