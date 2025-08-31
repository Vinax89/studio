// Utilities for queuing transactions when offline

const DB_NAME = 'offline-queue';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

let memoryQueue: unknown[] | null = typeof indexedDB === 'undefined' ? [] : null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function promisifyRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function queueTransaction<T>(transaction: T, maxQueueSize?: number): Promise<void> {
  if (memoryQueue) {
    memoryQueue.push(transaction);
    if (maxQueueSize !== undefined && memoryQueue.length > maxQueueSize) {
      memoryQueue.splice(0, memoryQueue.length - maxQueueSize);
    }
    return;
  }

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.add(transaction as any);

  if (maxQueueSize !== undefined) {
    const count = await promisifyRequest(store.count());
    if (count > maxQueueSize) {
      const excess = count - maxQueueSize;
      let deleted = 0;
      await new Promise<void>((resolve, reject) => {
        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (cursor && deleted < excess) {
            store.delete(cursor.primaryKey);
            deleted++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    }
  }

  await waitForTransaction(tx);
}

export async function getQueuedTransactions<T>(): Promise<T[]> {
  if (memoryQueue) {
    return [...memoryQueue] as T[];
  }

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const result = await promisifyRequest<T[]>(store.getAll());
  await waitForTransaction(tx);
  return result;
}

export async function clearQueuedTransactions(): Promise<void> {
  if (memoryQueue) {
    memoryQueue = [];
    return;
  }

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  await waitForTransaction(tx);
}

