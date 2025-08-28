importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js")

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"

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
          const contentType = request.headers.get("Content-Type") || ""
          let body

          if (contentType.includes("application/json")) {
            const clone = request.clone()
            try {
              body = await clone.json()
            } catch (parseErr) {
              console.warn("Failed to parse JSON payload", parseErr)
              try {
                body = await request.clone().text()
              } catch (textErr) {
                console.warn("Failed to read request body", textErr)
              }
            }
          } else {
            console.warn(`Unexpected content type: ${contentType}`)
            try {
              body = await request.clone().text()
            } catch (textErr) {
              console.warn("Failed to read request body", textErr)
            }
          }

          if (body !== undefined) {
            const db = await dbPromise
            await db.add(STORE_NAME, body)
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
