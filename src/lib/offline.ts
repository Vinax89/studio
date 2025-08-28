import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"

let memoryQueue: unknown[] = []
let persistenceAvailable = true

const dbPromise = (async () => {
  try {
    return await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true })
      },
    })
  } catch (err) {
    console.warn("IndexedDB unavailable, falling back to in-memory store", err)
    persistenceAvailable = false
    return undefined
  }
})()

export async function queueTransaction(tx: unknown) {
  try {
    const db = await dbPromise
    if (!db) throw new Error("no db")
    await db.add(STORE_NAME, tx)
  } catch (err) {
    console.warn("Failed to queue transaction; using in-memory store", err)
    memoryQueue.push(tx)
    persistenceAvailable = false
  }
}

export async function getQueuedTransactions<T = unknown>() {
  try {
    const db = await dbPromise
    if (!db) throw new Error("no db")
    return (await db.getAll(STORE_NAME)) as T[]
  } catch (err) {
    console.warn("Failed to get queued transactions; using in-memory store", err)
    return memoryQueue as T[]
  }
}

export async function clearQueuedTransactions() {
  try {
    const db = await dbPromise
    if (!db) throw new Error("no db")
    await db.clear(STORE_NAME)
    memoryQueue = []
  } catch (err) {
    console.warn(
      "Failed to clear queued transactions; clearing in-memory store",
      err,
    )
    memoryQueue = []
  }
}

export function isPersistenceAvailable() {
  return persistenceAvailable
}
