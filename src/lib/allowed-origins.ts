import { NextResponse } from "next/server";

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

function matches(origin: string, allowed: AllowedOrigin): boolean {
  return typeof allowed === "string" ? allowed === origin : allowed.test(origin);
}

export function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.some((allowed) => matches(origin, allowed));
}

export function withAllowedOrigin(req: Request, res: NextResponse): NextResponse {
  const origin = req.headers.get("Origin");
  if (!origin) return res;
  if (isOriginAllowed(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    return res;
  }
  return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
}
