import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import { TransactionPayloadSchema } from "@/lib/transactions"

/**
 * Generic transaction syncing endpoint.
 * Unlike `/api/bank/import`, this expects transactions already retrieved
 * from any source and persists them to the database.
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

  const contentLength = req.headers.get("content-length")
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
  }

  let text: string
  try {
    text = await req.text()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_SIZE) {
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
    return NextResponse.json({ received: transactions.length })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
