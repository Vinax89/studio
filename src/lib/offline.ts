import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const DEFAULT_MAX_QUEUE_SIZE = 100

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { autoIncrement: true })
  },
})

export async function queueTransaction(
  tx: unknown,
  maxQueueSize = DEFAULT_MAX_QUEUE_SIZE,
) {
  try {
    const db = await dbPromise
    await db.add(STORE_NAME, tx)

    const keys = await db.getAllKeys(STORE_NAME)
    const overflow = keys.length - maxQueueSize
    if (overflow > 0) {
      for (const key of keys.slice(0, overflow)) {
        await db.delete(STORE_NAME, key)
      }
    }
    return true
  } catch (error) {
    console.error("queueTransaction error", error)
    return false
  }
}

export async function getQueuedTransactions<T = unknown>() {
  try {
    const db = await dbPromise
    return (await db.getAll(STORE_NAME)) as T[]
  } catch (error) {
    console.error("getQueuedTransactions error", error)
    return null
  }
}

export async function clearQueuedTransactions() {
  try {
    const db = await dbPromise
    await db.clear(STORE_NAME)
    return true
  } catch (error) {
    console.error("clearQueuedTransactions error", error)
    return false
  }
}
