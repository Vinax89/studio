import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const MAX_RECORDS = 100

export type Result<T> = { ok: true; value: T } | { ok: false; error: unknown }

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { autoIncrement: true })
  },
})

export async function queueTransaction(tx: unknown): Promise<Result<void>> {
  try {
    const db = await dbPromise
    await db.add(STORE_NAME, tx)

    const count = await db.count(STORE_NAME)
    if (count > MAX_RECORDS) {
      const deleteCount = count - MAX_RECORDS
      const txObj = db.transaction(STORE_NAME, "readwrite")
      let cursor = await txObj.store.openCursor()
      let removed = 0
      while (cursor && removed < deleteCount) {
        await cursor.delete()
        cursor = await cursor.continue()
        removed++
      }
      await txObj.done
    }

    return { ok: true, value: undefined }
  } catch (error) {
    return { ok: false, error }
  }
}

export async function getQueuedTransactions<T = unknown>(): Promise<Result<T[]>> {
  try {
    const db = await dbPromise
    const all = (await db.getAll(STORE_NAME)) as T[]
    return { ok: true, value: all }
  } catch (error) {
    return { ok: false, error }
  }
}

export async function clearQueuedTransactions(): Promise<Result<void>> {
  try {
    const db = await dbPromise
    await db.clear(STORE_NAME)
    return { ok: true, value: undefined }
  } catch (error) {
    return { ok: false, error }
  }
}
