import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFirebaseToken } from "@/lib/server-auth";

/**
 * Imports transactions from a banking provider (e.g., Plaid, Finicity).
 * This endpoint deals with provider-specific payloads and is distinct from the
 * generic transaction syncing endpoint at `/api/transactions/sync`.
 */
const bodySchema = z.object({
  provider: z.string(),
  transactions: z.array(z.any()),
});

const MAX_BODY_SIZE = 1024 * 1024; // 1MB

export async function POST(req: Request) {
  try {
    await verifyFirebaseToken(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  let text: string;
  try {
    text = await req.text();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { provider, transactions } = parsed.data;

  try {
    return NextResponse.json({
      provider,
      imported: transactions.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
