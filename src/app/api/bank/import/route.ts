import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import { TransactionPayloadSchema, saveTransactions } from "@/lib/transactions"
import { PayloadTooLargeError, readBodyWithLimit } from "@/lib/http"
import { handleCors, withCors } from "@/lib/cors"

/**
 * Imports transactions from a banking provider (e.g., Plaid, Finicity).
 * This endpoint deals with provider-specific payloads and is distinct from the
 * generic transaction syncing endpoint at `/api/transactions/sync`.
 */
const bodySchema = z.object({
  provider: z.string(),
  transactions: z.array(TransactionPayloadSchema),
})

const MAX_BODY_SIZE = 1024 * 1024 // 1MB

export async function POST(req: Request) {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    await verifyFirebaseToken(req)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized"
    return withCors(
      req,
      NextResponse.json({ error: message }, { status: 401 }),
    )
  }

  let text: string
  try {
    text = await readBodyWithLimit(req, MAX_BODY_SIZE)
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return withCors(
        req,
        NextResponse.json({ error: err.message }, { status: err.status }),
      )
    }
    throw err
  }

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return withCors(
      req,
      NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    )
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return withCors(
      req,
      NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      ),
    )
  }

  const { provider, transactions } = parsed.data

  try {
    await saveTransactions(transactions)
    return withCors(
      req,
      NextResponse.json({
        provider,
        imported: transactions.length,
      }),
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status || 500
        : 500
    return withCors(
      req,
      NextResponse.json({ error: message }, { status }),
    )
  }
}
