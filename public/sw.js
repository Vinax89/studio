importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js")

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const MAX_QUEUE_LENGTH = 100

const dbPromise = idb.openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { autoIncrement: true })
  },
})

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
          const db = await dbPromise
          await db.add(STORE_NAME, body)
          const keys = await db.getAllKeys(STORE_NAME)
          if (keys.length > MAX_QUEUE_LENGTH) {
            const excess = keys.slice(0, keys.length - MAX_QUEUE_LENGTH)
            await Promise.all(excess.map((key) => db.delete(STORE_NAME, key)))
          }
          return new Response(JSON.stringify({ offline: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          })
        }
      })()
    )
  }
})
