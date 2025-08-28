import { headers } from 'next/headers'

export function getRequestNonce(): string | undefined {
  return headers().get('x-nonce') ?? undefined
}
