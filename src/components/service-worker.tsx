"use client"

import { useEffect } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"

export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error)
    }

    let debounceId: ReturnType<typeof setTimeout> | null = null

    const handleOnline = () => {
      if (debounceId) clearTimeout(debounceId)

      debounceId = setTimeout(async () => {
        const queued = await getQueuedTransactions()
        if (queued.length) {
          try {
            await fetch("/api/transactions/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactions: queued }),
            })
            await clearQueuedTransactions()
          } catch (error) {
            console.error("Failed to sync queued transactions", error)
          }
        }
      }, 1000)
    }

    window.addEventListener("online", handleOnline)
    return () => {
      window.removeEventListener("online", handleOnline)
      if (debounceId) clearTimeout(debounceId)
    }
  }, [])

  return null
}
