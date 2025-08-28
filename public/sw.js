importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js")

const DB_NAME = "offline-db"
const STORE_NAME = "transactions"

const dbPromise = idb.openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { autoIncrement: true })
  },
})

async function queueRequest(request) {
  const clone = request.clone()
  const contentType = clone.headers.get("Content-Type") || ""
  let body = null
  let text = null

  try {
    text = await clone.text()
  } catch (textErr) {
    console.warn("Failed to read request body", textErr)
  }

  if (text !== null) {
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(text)
      } catch (parseErr) {
        console.warn("Failed to parse JSON body", parseErr)
        body = { raw: text }
      }
    } else {
      body = { raw: text }
    }
  }

  if (body) {
    const db = await dbPromise
    await db.add(STORE_NAME, body)
  }
}

self.__queueRequest = queueRequest

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
          await queueRequest(request)
          return new Response(JSON.stringify({ offline: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" },
          })
        }
      })()
    )
  }
})
