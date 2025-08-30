import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const DEFAULT_MAX_QUEUE_SIZE = 100

let dbPromise: ReturnType<typeof openDB> | null = null

export type Result<T, E extends Error = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export async function getDb() {
  if (typeof indexedDB === "undefined") {
    return null
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true })
      },
    })
  }
  return dbPromise
}

/**
 * Enqueue a transaction in IndexedDB for offline processing.
 * The transaction is stored in the `transactions` object store and the
 * queue is capped at `maxQueueSize`, removing the oldest entries when the
 * limit is exceeded.
 *
 * @param tx Data to queue for later processing.
 * @param maxQueueSize Maximum number of transactions retained in storage.
 * @returns A {@link Result} indicating success or failure.
 */
export async function queueTransaction(
  tx: unknown,
  maxQueueSize = DEFAULT_MAX_QUEUE_SIZE,
): Promise<Result<void, Error>> {
  try {
    const db = await getDb()
    if (!db) {
      return { ok: false, error: new Error("IndexedDB is not supported") }
    }
    await db.add(STORE_NAME, tx)

    const total = await db.count(STORE_NAME)
    const overflow = total - maxQueueSize
    if (overflow > 0) {
      const txDelete = db.transaction(STORE_NAME, "readwrite")
      let cursor = await txDelete.store.openKeyCursor()
      for (let i = 0; cursor && i < overflow; i++) {
        await cursor.delete()
        cursor = await cursor.continue()
      }
      await txDelete.done
    }
    return { ok: true, value: undefined }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Retrieve all transactions currently queued in IndexedDB.
 * The returned list reflects the transactions stored by {@link queueTransaction}.
 *
 * @returns A {@link Result} containing queued transactions or an error.
 */
export async function getQueuedTransactions<T = unknown>(): Promise<
  Result<T[], Error>
> {
  try {
    const db = await getDb()
    if (!db) {
      return { ok: false, error: new Error("IndexedDB is not supported") }
    }
    return { ok: true, value: (await db.getAll(STORE_NAME)) as T[] }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Remove all queued transactions from IndexedDB storage.
 * This clears the offline queue used by {@link queueTransaction}.
 *
 * @returns A {@link Result} indicating success or failure.
 */
export async function clearQueuedTransactions(): Promise<Result<void, Error>> {
  try {
    const db = await getDb()
    if (!db) {
      return { ok: false, error: new Error("IndexedDB is not supported") }
    }
    await db.clear(STORE_NAME)
    return { ok: true, value: undefined }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
