import { NextResponse } from "next/server";
import { runHousekeeping } from "@/lib/housekeeping";

// HTTP GET endpoint invoked by Cloud Scheduler or cron job
export async function GET() {
  try {
    await runHousekeeping();
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Housekeeping failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
