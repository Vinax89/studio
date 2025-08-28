import { NextResponse } from "next/server";
import { runHousekeeping } from "@/lib/housekeeping";

const HEADER_NAME = "x-cron-secret";
const WINDOW_MS = 60_000; // 1 minute
let lastInvocation = 0;

// Exposed for tests to reset the in-memory rate limiter
export function resetRateLimit() {
  lastInvocation = 0;
}

// HTTP GET endpoint invoked by Cloud Scheduler or cron job
export async function GET(req: Request) {
  const secret = req.headers.get(HEADER_NAME);
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  if (now - lastInvocation < WINDOW_MS) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  lastInvocation = now;

  await runHousekeeping();
  return NextResponse.json({ status: "ok" });
}
