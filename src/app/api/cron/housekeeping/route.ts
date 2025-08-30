import { NextResponse } from "next/server";
import { runHousekeeping } from "@/lib/housekeeping";
import { getFirebase } from "@/lib/firebase";
import { getCurrentTime } from "@/lib/internet-time";
import { doc, runTransaction, setDoc } from "firebase/firestore";
import { logger } from "@/lib/logger";

const HEADER_NAME = "x-cron-secret";
const WINDOW_MS = 60_000; // 1 minute
const { db } = getFirebase();
const STATE_DOC = doc(db, "cron", "housekeeping");

// Exposed for tests to reset the persisted rate limiter
export async function resetRateLimit() {
  await setDoc(STATE_DOC, { lastRun: 0 });
}

// HTTP GET endpoint invoked by Cloud Scheduler or cron job
export async function GET(req: Request) {
  const secret = req.headers.get(HEADER_NAME);
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = (await getCurrentTime()).getTime();
    const allowed = await runTransaction(db, async (tx) => {
      const snap = await tx.get(STATE_DOC);
      const last = snap.exists() ? snap.data().lastRun ?? 0 : 0;
      if (now - last < WINDOW_MS) {
        return false;
      }
      tx.set(STATE_DOC, { lastRun: now });
      return true;
    });

    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    await runHousekeeping();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    logger.error("Housekeeping run failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
