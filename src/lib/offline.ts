import { openDB } from "idb"
import { logger } from "@/lib/logger"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const DEFAULT_MAX_QUEUE_SIZE = 100

let dbPromise: ReturnType<typeof openDB> | null = null

export async function getDb() {
  if (typeof indexedDB === "undefined") {
    logger.error("IndexedDB is not supported in this environment")
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
 * limit is exceeded. Errors are logged via the logger.
 *
 * @param tx Data to queue for later processing.
 * @param maxQueueSize Maximum number of transactions retained in storage.
 * @returns `true` if the transaction was queued successfully, otherwise `false`.
 */
export async function queueTransaction(
  tx: unknown,
  maxQueueSize = DEFAULT_MAX_QUEUE_SIZE,
) {
  try {
    const db = await getDb()
    if (!db) return false
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
    return true
  } catch (error) {
    logger.error("queueTransaction error", error)
    return false
  }
}

/**
 * Retrieve all transactions currently queued in IndexedDB.
 * The returned list reflects the transactions stored by {@link queueTransaction}.
 * Errors are logged via the logger.
 *
 * @returns An array of queued transactions or `null` if retrieval fails.
 */
export async function getQueuedTransactions<T = unknown>() {
  try {
    const db = await getDb()
    if (!db) return null
    return (await db.getAll(STORE_NAME)) as T[]
  } catch (error) {
    logger.error("getQueuedTransactions error", error)
    return null
  }
}

/**
 * Remove all queued transactions from IndexedDB storage.
 * This clears the offline queue used by {@link queueTransaction}.
 * Errors are logged via the logger.
 *
 * @returns `true` if the queue was cleared successfully, otherwise `false`.
 */
export async function clearQueuedTransactions() {
  try {
    const db = await getDb()
    if (!db) return false
    await db.clear(STORE_NAME)
    return true
  } catch (error) {
    logger.error("clearQueuedTransactions error", error)
    return false
  }
}
