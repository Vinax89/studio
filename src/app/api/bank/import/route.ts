import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyFirebaseToken } from "@/lib/server-auth"
import { collection, getDocs } from "firebase/firestore"
import { PayloadTooLargeError, readBodyWithLimit } from "@/lib/http"
import { getProviderMapper } from "@/lib/providers"
import {
  validateTransactions,
  saveTransactions,
  type TransactionRowType,
} from "@/lib/transactions"
import { logger } from "@/lib/logger"
import { db, initFirebase } from "@/lib/firebase"

/**
 * Imports transactions from a banking provider (e.g., Plaid, Finicity).
 * This endpoint deals with provider-specific payloads and is distinct from the
 * generic transaction syncing endpoint at `/api/transactions/sync`.
 */
const bodySchema = z.object({
  provider: z.string(),
  transactions: z.array(z.unknown()),
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

  const { provider, transactions } = parsed.data

  let rows: TransactionRowType[]
  try {
    const mapper = getProviderMapper(provider)
    rows = mapper(transactions)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unsupported provider"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  initFirebase()
  let categories: string[]
  try {
    const snapshot = await getDocs(collection(db, "categories"))
    categories = snapshot.docs.map((doc) => doc.id)
  } catch (err) {
    logger.error("Failed to fetch categories", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }

  let validated
  try {
    validated = validateTransactions(rows, categories)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid transactions"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    await saveTransactions(validated)
    return NextResponse.json({ provider, imported: validated.length })
  } catch (err) {
    logger.error("Failed to persist transactions", err)
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
