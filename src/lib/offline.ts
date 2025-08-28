import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"

export interface QueuedTransaction {
  [key: string]: unknown
}

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db, oldVersion) {
    switch (oldVersion) {
      case 0:
        db.createObjectStore(STORE_NAME, { autoIncrement: true })
        // future migrations can be handled with additional cases
    }
  },
})

export async function queueTransaction(tx: QueuedTransaction): Promise<void> {
  try {
    const db = await dbPromise
    await db.add(STORE_NAME, tx)
  } catch (error) {
    console.error("Failed to queue transaction", error)
  }
}

export async function getQueuedTransactions(): Promise<QueuedTransaction[]> {
  try {
    const db = await dbPromise
    return await db.getAll(STORE_NAME)
  } catch (error) {
    console.error("Failed to get queued transactions", error)
    return []
  }
}

export async function clearQueuedTransactions(): Promise<void> {
  try {
    const db = await dbPromise
    await db.clear(STORE_NAME)
  } catch (error) {
    console.error("Failed to clear queued transactions", error)
  }
}
