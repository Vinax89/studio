import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import type { TransactionRowType } from "@/lib/transactions"

/**
 * Generic transaction syncing endpoint.
 * Unlike `/api/bank/import`, this expects transactions already retrieved
 * from any source and persists them to the database.
 */
const transactionSchema: z.ZodType<TransactionRowType> = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.preprocess(
    (val) => (typeof val === "number" || typeof val === "string" ? String(val) : val),
    z.string(),
  ),
  type: z.enum(["Income", "Expense"]),
  category: z.string(),
  isRecurring: z.union([z.boolean(), z.string()]).optional(),
})

const bodySchema = z.object({
  transactions: z.array(transactionSchema),
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
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")
    return NextResponse.json(
      { error: `Invalid transaction payload: ${message}` },
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
