import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { transactions } = await req.json()
  // Here you would normally persist transactions to a database
  return NextResponse.json({ received: Array.isArray(transactions) ? transactions.length : 0 })
}
