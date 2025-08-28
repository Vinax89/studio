importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js")

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const MAX_QUEUE = 50
const STALE_AGE = 7 * 24 * 60 * 60 * 1000 // one week

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
          const tx = db.transaction(STORE_NAME, "readwrite")
          const store = tx.store
          const now = Date.now()

          let count = await store.count()
          let cursor = await store.openCursor()
          while (cursor) {
            const value = cursor.value
            const isStale = value.timestamp && value.timestamp < now - STALE_AGE
            if (isStale || count >= MAX_QUEUE) {
              await cursor.delete()
              count--
            }
            cursor = await cursor.continue()
          }

          await store.add({ data: body, timestamp: now })
          await tx.done

          return new Response(JSON.stringify({ offline: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          })
        }
      })()
    )
  }
})
