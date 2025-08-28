import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { autoIncrement: true })
  },
})

export async function queueTransaction(tx: unknown): Promise<void> {
  const db = await dbPromise
  await db.add(STORE_NAME, tx)
}

export async function getQueuedTransactions<T = unknown>(): Promise<T[]> {
  const db = await dbPromise
  return db.getAll(STORE_NAME) as Promise<T[]>
}

export async function clearQueuedTransactions(): Promise<void> {
  const db = await dbPromise
  await db.clear(STORE_NAME)
}
