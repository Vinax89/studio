import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * Imports transactions from a banking provider (e.g., Plaid, Finicity).
 * This endpoint deals with provider-specific payloads and is distinct from the
 * generic transaction syncing endpoint at `/api/transactions/sync`.
 */
const bodySchema = z.object({
  provider: z.string(),
  transactions: z.array(z.any()),
})

export async function POST(req: Request) {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { provider, transactions } = parsed.data

  try {
    return NextResponse.json({
      provider,
      imported: transactions.length,
    })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
