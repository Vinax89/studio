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
        const queuedResult = await getQueuedTransactions()
        if (queuedResult.ok && queuedResult.value.length) {
          try {
            await fetch("/api/transactions/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transactions: queuedResult.value }),
            })
            const clearResult = await clearQueuedTransactions()
            if (!clearResult.ok) {
              console.error(
                "Failed to clear queued transactions",
                clearResult.error,
              )
            }
          } catch (error) {
            console.error("Failed to sync queued transactions", error)
          }
        } else if (!queuedResult.ok) {
          console.error(
            "Failed to get queued transactions",
            queuedResult.error,
          )
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
