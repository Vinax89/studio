import { NextResponse } from "next/server";
import type { AllowedOrigin } from "./allowed-origins";
import { allowedOrigins } from "./allowed-origins";

function isAllowed(origin: string, allowed: AllowedOrigin[]): boolean {
  return allowed.some((o) =>
    typeof o === "string" ? o === origin : o.test(origin),
  );
}

export function handleCors(
  req: Request,
  allowed: AllowedOrigin[] = allowedOrigins,
): Response | undefined {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    if (!origin || !isAllowed(origin, allowed)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const headers = new Headers({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods":
        req.headers.get("Access-Control-Request-Method") || "",
      "Access-Control-Allow-Headers":
        req.headers.get("Access-Control-Request-Headers") || "",
      Vary: "Origin",
    });
    return new Response(null, { status: 204, headers });
  }

  if (origin && !isAllowed(origin, allowed)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return undefined;
}

export function withCors(
  req: Request,
  res: Response,
  allowed: AllowedOrigin[] = allowedOrigins,
): Response {
  const origin = req.headers.get("Origin");
  if (origin && isAllowed(origin, allowed)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    const vary = res.headers.get("Vary");
    if (!vary) {
      res.headers.set("Vary", "Origin");
    } else if (!vary.split(",").map((v) => v.trim()).includes("Origin")) {
      res.headers.set("Vary", `${vary}, Origin`);
    }
  }
  return res;
}

export { isAllowed as isOriginAllowed };

