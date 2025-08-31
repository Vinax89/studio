import { vi } from 'vitest'

declare global {
  // eslint-disable-next-line no-var
  var jest: typeof vi & { requireActual: typeof vi.importActual }
}

export {}
