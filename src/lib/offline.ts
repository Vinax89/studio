import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'offlineQueue';
const STORE_NAME = 'transactions';
let dbPromise: Promise<IDBPDatabase<any>> | null = null;
const memoryQueue: unknown[] = [];

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

async function getDB(): Promise<IDBPDatabase<any>> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            autoIncrement: true,
          });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Queue a transaction for later processing. If maxQueueSize is provided,
 * the queue will keep only the most recent entries up to that limit.
 */
export async function queueTransaction<T>(
  transaction: T,
  maxQueueSize?: number,
): Promise<void> {
  if (!hasIndexedDB()) {
    memoryQueue.push(transaction);
    if (maxQueueSize && memoryQueue.length > maxQueueSize) {
      memoryQueue.splice(0, memoryQueue.length - maxQueueSize);
    }
    return;
  }

  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.add(transaction);

  if (maxQueueSize) {
    const count = await tx.store.count();
    let toDelete = count - maxQueueSize;
    if (toDelete > 0) {
      let cursor = await tx.store.openCursor();
      while (cursor && toDelete > 0) {
        await cursor.delete();
        toDelete--;
        cursor = await cursor.continue();
      }
    }
  }

  await tx.done;
}

/**
 * Retrieve all queued transactions in the order they were added.
 */
export async function getQueuedTransactions<T>(): Promise<T[]> {
  if (!hasIndexedDB()) {
    return [...memoryQueue] as T[];
  }

  const db = await getDB();
  return db.getAll(STORE_NAME);
}

/**
 * Clear all queued transactions.
 */
export async function clearQueuedTransactions(): Promise<void> {
  if (!hasIndexedDB()) {
    memoryQueue.length = 0;
    return;
  }

  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}

