const DB_NAME = "offline-db"
const STORE_NAME = "transactions"

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { autoIncrement: true })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const dbPromise = openDatabase()

async function addQueuedTransaction(tx) {
  const db = await dbPromise
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite")
    transaction.objectStore(STORE_NAME).add(tx)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

self.addEventListener("fetch", event => {
  const { request } = event
  if (
    request.method === "POST" &&
    request.url.includes("/api/transactions") &&
    !request.url.includes("/sync")
  ) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request)
        } catch (err) {
          const clone = request.clone()
          const body = await clone.json()
          await addQueuedTransaction(body)
          return new Response(JSON.stringify({ offline: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          })
        }
      })()
    )
  }
})
