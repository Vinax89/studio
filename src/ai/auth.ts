'use server'

import { headers } from 'next/headers'

// Simple in-memory rate limiter keyed by user ID.
const requests = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 5

/**
 * Ensures the request is authenticated and enforces a basic per-user rate limit.
 * Returns the authenticated user's uid on success.
 *
 * In test environments, auth and rate limiting are skipped.
 */
export async function ensureAuth(): Promise<string> {
  if (process.env.NODE_ENV === 'test') {
    return 'test-user'
  }

  const authHeader = headers().get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }
  const token = authHeader.slice('Bearer '.length)

  const { getApps, initializeApp } = await import('firebase-admin/app')
  const { getAuth } = await import('firebase-admin/auth')
  if (!getApps().length) {
    initializeApp()
  }
  const decoded = await getAuth().verifyIdToken(token)
  const uid = decoded.uid

  const now = Date.now()
  const record = requests.get(uid)
  if (record && record.reset > now && record.count >= MAX_REQUESTS) {
    throw new Error('Rate limit exceeded')
  }
  if (!record || record.reset <= now) {
    requests.set(uid, { count: 1, reset: now + WINDOW_MS })
  } else {
    record.count++
  }

  return uid
}
