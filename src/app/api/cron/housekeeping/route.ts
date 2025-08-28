import { NextResponse } from "next/server";
import { runHousekeeping } from "@/lib/housekeeping";

// HTTP GET endpoint invoked by Cloud Scheduler or cron job
export async function GET() {
  await runHousekeeping();
  return NextResponse.json({ status: "ok" });
}
