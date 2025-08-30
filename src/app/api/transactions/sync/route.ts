import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import { TransactionPayloadSchema, importTransactions } from "@/lib/transactions"
import { readBodyWithLimit } from "@/lib/http"

/**
 * Generic transaction syncing endpoint.
 * Unlike `/api/bank/import`, this expects transactions that have already
 * been fetched from any source. The current implementation only validates
 * and reports how many transactions were received without persisting them.
 * TODO: Implement database persistence for received transactions.
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

  const text = await readBodyWithLimit(req, MAX_BODY_SIZE)
  if (text === null) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
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
    await importTransactions(
      transactions as Parameters<typeof importTransactions>[0],
    )
    return NextResponse.json({ imported: transactions.length })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to import transactions"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
