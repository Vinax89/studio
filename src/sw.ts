import { openDB } from "idb"

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const MAX_QUEUE_LENGTH = 100

const dbPromise = openDB(DB_NAME, 1, {
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
        } catch {
          const clone = request.clone()
          const body = await clone.json()
          const db = await dbPromise
          await db.add(STORE_NAME, body)
          const total = await db.count(STORE_NAME)
          const overflow = total - MAX_QUEUE_LENGTH
          if (overflow > 0) {
            const tx = db.transaction(STORE_NAME, "readwrite")
            let cursor = await tx.store.openKeyCursor()
            for (let i = 0; cursor && i < overflow; i++) {
              await cursor.delete()
              cursor = await cursor.continue()
            }
            await tx.done
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
