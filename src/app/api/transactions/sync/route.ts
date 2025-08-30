import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import { TransactionPayloadSchema } from "@/lib/transactions"
import { readBodyWithLimit } from "@/lib/http"
import { db } from "@/lib/firebase"
import { collection, doc, setDoc } from "firebase/firestore"

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
    const colRef = collection(db, "transactions")
    const results = await Promise.allSettled(
      transactions.map((tx) => setDoc(doc(colRef, tx.id), tx).then(() => tx.id)),
    )

    const saved: string[] = []
    const errors: { id: string; error: string }[] = []

    results.forEach((res, idx) => {
      const id = transactions[idx].id
      if (res.status === "fulfilled") {
        saved.push(res.value)
      } else {
        errors.push({
          id,
          error: res.reason instanceof Error ? res.reason.message : String(res.reason),
        })
      }
    })

    if (errors.length > 0) {
      return NextResponse.json({ saved, errors }, { status: 500 })
    }

    return NextResponse.json({ saved })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
