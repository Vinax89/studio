import { NextResponse } from "next/server"

/**
 * Generic transaction syncing endpoint.
 * Unlike `/api/bank/import`, this expects transactions already retrieved
 * from any source and persists them to the database.
 */
export async function POST(req: Request) {
  const { transactions } = await req.json()
  // In a real implementation these transactions would be persisted to a database.
  return NextResponse.json({ received: Array.isArray(transactions) ? transactions.length : 0 })
}
