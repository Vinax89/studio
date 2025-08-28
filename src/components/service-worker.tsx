"use client"

import { useEffect } from "react"
import { getQueuedTransactions, clearQueuedTransactions } from "@/lib/offline"

export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error)
    }

    const handleOnline = async () => {
      const queued = await getQueuedTransactions()
      if (queued.length) {
        await fetch("/api/transactions/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: queued }),
        })
        await clearQueuedTransactions()
      }
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  return null
}
