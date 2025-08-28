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

async function readBodyWithLimit(req: Request, limit: number) {
  const contentLength = req.headers.get("content-length")
  if (contentLength && Number(contentLength) > limit) {
    return null
  }

  const reader = req.body?.getReader()
  if (!reader) {
    return ""
  }
  const decoder = new TextDecoder()
  let total = 0
  let result = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (value) {
      total += value.length
      if (total > limit) {
        return null
      }
      result += decoder.decode(value, { stream: true })
    }
  }
  result += decoder.decode()
  return result
}

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
    return NextResponse.json({ received: transactions.length })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
