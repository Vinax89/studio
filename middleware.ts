// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(req: Request) {
  // Log the Origin hitting the server (only in dev)
  // You’ll see it in your terminal; confirm it matches an allowedDevOrigins entry.
  console.log('[Origin]', (req.headers as any).get('origin'));
  return NextResponse.next();
}
