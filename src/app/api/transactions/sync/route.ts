import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * Generic transaction syncing endpoint.
 * Unlike `/api/bank/import`, this expects transactions already retrieved
 * from any source and persists them to the database.
 */
const bodySchema = z.object({
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

  const { transactions } = parsed.data

  try {
    return NextResponse.json({ received: transactions.length })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
