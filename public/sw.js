importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js")

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"
const MAX_RECORDS = 100

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
          try {
            await db.add(STORE_NAME, body)
            const count = await db.count(STORE_NAME)
            if (count > MAX_RECORDS) {
              const deleteCount = count - MAX_RECORDS
              const tx = db.transaction(STORE_NAME, "readwrite")
              let cursor = await tx.store.openCursor()
              let removed = 0
              while (cursor && removed < deleteCount) {
                await cursor.delete()
                cursor = await cursor.continue()
                removed++
              }
              await tx.done
            }
          } catch (dbErr) {
            console.error("Failed to store offline transaction", dbErr)
            return new Response(null, { status: 500 })
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
