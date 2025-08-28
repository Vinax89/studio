import { NextResponse } from "next/server";
import { runHousekeeping } from "@/lib/housekeeping";
import { db } from "@/lib/firebase";
import { doc, runTransaction, setDoc } from "firebase/firestore";

const HEADER_NAME = "x-cron-secret";
const WINDOW_MS = 60_000; // 1 minute

const docRef = doc(db, "cron", "housekeeping");

// Exposed for tests to reset the shared rate limiter
export async function resetRateLimit() {
  await setDoc(docRef, { lastInvocation: 0 });
}

// HTTP GET endpoint invoked by Cloud Scheduler or cron job
export async function GET(req: Request) {
  const secret = req.headers.get(HEADER_NAME);
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await runTransaction(db, async (tx) => {
    const snap = await tx.get(docRef);
    const last = snap.exists() ? (snap.data().lastInvocation as number) : 0;
    const now = Date.now();
    if (now - last < WINDOW_MS) {
      return false;
    }
    tx.set(docRef, { lastInvocation: now });
    return true;
  });

  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await runHousekeeping();
  return NextResponse.json({ status: "ok" });
}
