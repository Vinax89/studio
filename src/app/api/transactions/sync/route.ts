import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import { TransactionPayloadSchema, saveTransactions } from "@/lib/transactions"
import { PayloadTooLargeError, readBodyWithLimit } from "@/lib/http"

/**
 * Generic transaction syncing endpoint.
 * Unlike `/api/bank/import`, this expects transactions that have already
 * been fetched from any source. The endpoint validates incoming transactions
 * and persists them to the database in batches.
 */
const bodySchema = z.object({
  transactions: z.array(TransactionPayloadSchema),
})

const MAX_BODY_SIZE = 1024 * 1024 // 1MB

export async function POST(req: Request) {
  try {
    await verifyFirebaseToken(req)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized"
    return NextResponse.json({ error: message }, { status: 401 })
  }

  let text: string
  try {
    text = await readBodyWithLimit(req, MAX_BODY_SIZE)
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    throw err
  }

  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { transactions } = parsed.data

  try {
    // Persist all transactions using a batch write for atomicity.
    await saveTransactions(transactions)
    return NextResponse.json({ received: transactions.length })
  } catch (err) {
    console.error("Failed to persist transactions", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
